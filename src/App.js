/**
 * Base application class
 *
 * Contains various helper methods, store and handle "Controller" modules.
 *
 * @author Andrew Tereshko <andrew.tereshko@gmail.com>
 * @version 0.3.2
 */
define( [ './Router', './State', './Logger', './IModule', './ADeferredModule'], function( Router, State, Logger, IModule, ADeferredModule ) {
    'use strict';

    /**
     * @class yam.Core
     * @extends jQuery.Class
     */
    $.Class.extend( 'yam.Core',
        /* @static */
        {
            _instance: undefined,

            _readyCallbacks: [],

            getInstance: function (options) {
                if (!this._instance) this._instance = new this(options);
                return this._instance;
            },

            ready: function( selector, callback ) {

                if( typeof selector === 'function' ){
                    callback = selector;
                    selector = undefined;
                }

                var def = $.Deferred(), defCallback = function(){

                    def.resolve( this );

                    if( typeof callback === 'function' ) {
                        callback( this );
                    }
                };

                if ( this.getInstance()._ready ) {
                    $(selector).whenReady( defCallback );
                } else {
                    this._readyCallbacks.push( { selector: selector, callback: defCallback } );
                }

                return def.promise();
            }
        },
        /* @prototype */
        {
            options: {
                routes: {},
                baseNamespace: 'App'
            },

            /**
             * current Controller modules
             *
             */
            _modules: {},

            _modulesToReady: {},

            _ready: false,
            _reRun: false,
            runCnt:0,
            timers:{},

            /**
             * Constructor
             *
             * @param options Application config
             */
            init: function ( options ) {

                this.startTime = new Date().getTime();

                if( this.Class._instance ) throw new Error('Another instance already created. Use getInstance()');

                this.Class._instance = this;

                $.extend(this.options, options || {});

                Logger.log(this,'Init');

                // Binding route rules to modules
                $.each(this.options.routes, function (moduleName, routes) {
                    $.each(routes, function (i, routeRule) {
                        Router.add(routeRule, moduleName);
                    });
                });

                // Bind to state change
                $( State ).bind( 'locationChange', this.proxy('run') );
            },

            run: function () {

                if( this._ready === false && this.runCnt > 0 ){
                    this._reRun = true;

                    return;
                }

                var stateData = State.current().data,
                    time = new Date().getTime(),
                    className;

                // skip this run in case skip
                if( stateData !== undefined && stateData.skipRun === true && this.runCnt > 0 ){
                    Logger.log( this, 'skipping run' );
                    return;
                }


                this.runCnt++;

                if( this.runCnt > 1 ){ this.startTime = time; }

                this._unready();

                var matches = Router.match();

                // Check which modules must be destroyed
                for ( className in this._modules) {
                    if (undefined === matches[ className ] ){
                        this._unregisterModule( className );
                    }
                }

                // 404 behavior
                if( $.isEmptyObject(matches) ) {

                    Logger.log(this, 'Request unresolved (' + State.current().location + ')');

                    this._setReady();

                } else {

                    // Run matched modules
                    for ( className in matches) {

                        this._modulesToReady[className] = className;

                        this.timers[className] = new Date().getTime();

                        require( [this._getModuleNameByClass(className)], this.proxy( '_onLoadModule', className, matches[className] ) );
                    }
                }
            },

            _registerModule: function(className, params) {
                if (undefined === this._modules[className]) {
                    var classInstance = $.String.getObject(className , window, true);

                    if(classInstance && typeof classInstance == 'function') {
                        var module = new classInstance( params );

                        Logger.log(module, 'init');

                        this._modules[className] = module;

                        Logger.log(this, className + ' module registered');
                    } else if (this.debug) {
                        Logger.error('[App] Can not create instance of class "' + className + '" requested by path "' + this._getModuleNameByClass(className) + '"');
                    }
                }

                return this._modules[className] ? true : false;
            },

            _unregisterModule: function (className) {
                if (undefined === this._modules[className]) return false;

                if (this._modules[className].destruct !== undefined) {
                    Logger.log(this._modules[className], 'destruct');

                    this._modules[className].destruct();
                }

                // crunch
                delete(this._modules[className]);
            },

            _onLoadModule: function (className, params) {

                this._registerModule(className, params );

                if (this._modules[className] !== undefined && this._modules[className].run !== undefined) {

                    if ( this._modules[className] instanceof ADeferredModule) {

                        this._modules[className].onReady( this.proxy('_onReadyModule', className ) );

                        this._modules[className].run(params);

                    } else {
                        this._modules[className].run(params);

                        this._onReadyModule(className);
                    }
                }
            },

            _onReadyModule: function (className) {
                    var time = new Date().getTime();
                Logger.tLog(this._modules[className], className, 'ready ['+(time - this.timers[className])+'ms]['+(time - this.startTime)+'ms]');
                delete(this._modulesToReady[className]);

                var size = 0, key;
                for (key in this._modulesToReady) {
                    if (this._modulesToReady.hasOwnProperty(key)) size++;
                }

                if (size == 0) {
                    this._setReady();
                }
            },

            /**
             * Drops Core 'ready' state
             *
             * @private
             */
            _unready: function () {
                app.Logger.log(this, 'Drop ready state');

                this._ready = false;
                this._modulesToReady = {};

                if( undefined !== (window).whenReadyKillall )
                    $(window).whenReadyKillall();
            },

            /**
             * Set Core 'ready' state
             * @private
             */
            _setReady: function () {
                var time = new Date().getTime();
                Logger.tLog(this, 'Ready ['+(time - this.startTime)+'ms]');

                this._ready = true;

                // event fire
                $([ this ]).trigger('ready');

                // DOM ready
                // @TODO - move this from framework core
                while( this.Class._readyCallbacks.length > 0 ){

                    var item = this.Class._readyCallbacks.shift();

                    if( undefined === item.callback || typeof item.callback !== 'function' ) continue;

                    if( undefined === item.selector ) {
                        item.callback();
                    } else {
                        $( item.selector ).whenReady( item.callback );
                    }
                }

                if( this._reRun !== false ){
                    this._reRun = false;
                    this.run();
                }
            },

            _getClassNameByModule: function (moduleName) {
                var nameChunks = moduleName.split("/"), nameChunkCount = nameChunks.length;

                if (this.options.baseNamespace) {
                    nameChunkCount = nameChunks.unshift(this.options.baseNamespace);
                }

                while (nameChunkCount--) {
                    nameChunks[nameChunkCount] = nameChunks[nameChunkCount].charAt(0).toUpperCase() + nameChunks[nameChunkCount].slice(1);
                }

                return nameChunks.join(".");
            },

            _getModuleNameByClass: function (className) {
                if (this.options.baseNamespace) {
                    className = className.replace( this.options.baseNamespace + ".", "" );
                }

                var nameChunks = className.split( "." ), nameChunkCount = nameChunks.length;

                //while (nameChunkCount--) {
                    //nameChunks[ nameChunkCount ] = nameChunks[ nameChunkCount ].charAt(0).toLowerCase() + nameChunks[ nameChunkCount ].slice(1);
                //}

                return nameChunks.join("/");
            }
        }
    );

    // backward compatibility
    if( window.app === undefined ) window.app = {};
    window.app.App = yam.Core;

    return yam.Core;
});

