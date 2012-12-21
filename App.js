/**
 * Base application class
 *
 * Contains various helper methods, store and handle "Controller" modules.
 *
 * @author Andrew Tereshko <andrew.tereshko@gmail.com>
 * @version 0.2.1
 */
define("app/App", ["app/Router", "app/Hub", "app/Logger", "app/IModule", "app/ADeferredModule"], function( Router, Hub, Logger, IModule, ADeferredModule ) {
    "use strict";

    $.Class.extend("app.App", {
        /* @static */
        _instance: undefined,

        _whenReadies: [],
        _readyCallbacks: [],
        getInstance: function (options) {
            if (!this._instance) this._instance = new app.App(options);
            return this._instance;
        },

        when: function (selector, callback) {

            if ( this.getInstance()._ready) {
                $(selector).whenReady(callback);
            } else {
                this._whenReadies.push([selector, callback]);
            }
        },
        ready: function( selector, callback ) {

            if( typeof selector === "function" ){
                callback = selector;
                selector = undefined;
            }

            var def = $.Deferred(), defCallback = function(){

                def.resolve( this );

                if( typeof callback === "function" ) {
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
    }, {
        /* @prototype */
        options: {
            routes: {},
            baseNamespace: "App"
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
        init: function (options) {
            this.startTime = new Date().getTime();
            if( this.Class._instance ) throw new Error("Another instance already created. Use getInstance()");

            this.Class._instance = this;

            $.extend(this.options, options || {});

            app.Logger.log(this,"Init");

            // Binding route rules to modules
            $.each(this.options.routes, function (moduleName, routes) {
                $.each(routes, function (i, routeRule) {
                    Router.add(routeRule, moduleName);
                });
            });

            var history = window.History;

            if ( window.location.toString().search(/#/) && !history.isTraditionalAnchor( history.getHash() ) ) {
                app.Logger.warn( "IF", history.getHash(), history.getHash().search(/^\//) );
                if ( history.getHash().search(/^\//) >= 0 ) {
                    window.location = history.getHash();
                } else {
                    window.location = history.getBasePageUrl() + history.getHash();
                }
            } else {
                // App run on every hash change
                $(window).bind("statechange.app", this.proxy("run"));
            }
        },

        run: function () {
        
            if( this._ready === false && this.runCnt > 0 ){
                this._reRun = true;
                
                return;
            }
        
            var state = History.getState(),
	            time = new Date().getTime(),
	            className;


	        // deprecated !!!! @TODO - remove this peace of shit
            if( typeof state.data.ajaxer !="undefined" && !state.data.ajaxer && this.runCnt!=0){
	            app.Logger.log(this, "Exit: ajaxer disabled",state.data);
	            return;
            }

            // skip this run in case skip
	        if( state.data !== undefined && state.data.skipRun === true ){
		        app.Logger.log( this, "skipping run" );
		        return;
	        }

            this.runCnt++;

            if( this.runCnt > 1 ){ this.startTime = time; }

            this._unready();

            var matches = Router.match();

            // 404 behavior
            if($.isEmptyObject(matches)) {
                Logger.log(this, "Request unresolved (" + Router.getCurrentPath() + ")");

                this.cleanup();
            }

            // Check whitch modules must be destroyed
            for ( className in this._modules) {
                if (undefined === matches[ className ] ){
	                this._unregisterModule( className );
                }
            }

            for ( className in matches) {
                this._modulesToReady[className] = className;
            }

            // Run matched modules
            for ( className in matches) {
                this.timers[className] = new Date().getTime();

                require([this._getModuleNameByClass(className)], this.proxy( "_onLoadModule", className, matches[className] ) );
            }
        },

        cleanup: function() {
            Logger.log(this, "Cleanup");

            for ( var moduleName in this._modules) {
                this._unregisterModule( moduleName );
            }

            this._modules = {};

            this._unready();
        },

        _registerModule: function(className, params) {
            if (undefined === this._modules[className]) {
                var classInstance = $.String.getObject(className , window, true);

                if(classInstance && typeof classInstance == "function") {
                    var module = new classInstance( params );

                    Logger.log(module, "init");

                    this._modules[className] = module;

                    Logger.log(this, className + " module registered");
                } else if (this.debug) {
                    Logger.error('[App] Can not create instance of class "' + className + '" requested by path "' + this._getModuleNameByClass(className) + '"');
                }
            }

            return this._modules[className] ? true : false;
        },

        _unregisterModule: function (className) {
            if (undefined === this._modules[className]) return false;

            if (this._modules[className].destruct !== undefined) {
                Logger.log(this._modules[className], "destruct");

                this._modules[className].destruct();
            }

            // crunch
            delete(this._modules[className]);
        },

        _onLoadModule: function (className, params) {

            this._registerModule(className, params );

            if (this._modules[className] !== undefined && this._modules[className].run !== undefined) {
                
                if ( this._modules[className] instanceof ADeferredModule) {

                    this._modules[className].onReady( this.proxy("_onReadyModule", className ) );

                    this._modules[className].run(params);

                } else {
                    this._modules[className].run(params);

                    this._onReadyModule(className);
                }
            }
        },

        _onReadyModule: function (className) {
                var time = new Date().getTime();
            Logger.tLog(this._modules[className], className, "ready ["+(time - this.timers[className])+"ms]["+(time - this.startTime)+"ms]");
            delete(this._modulesToReady[className]);

            var size = 0, key;
            for (key in this._modulesToReady) {
                if (this._modulesToReady.hasOwnProperty(key)) size++;
            }

            if (size == 0) {
                this._setReady();
            }
        },

        _unready: function () {
            app.Logger.log(this, "Drop ready state");

            this._ready = false;
            this._modulesToReady = {};
            app.App._whenReadies = [];

            if( undefined !== (window).whenReadyKillall )
                $(window).whenReadyKillall();
        },

        _setReady: function () {
            var time = new Date().getTime();
            Logger.tLog(this, "Ready ["+(time - this.startTime)+"ms]");

            this._ready = true;

            while (app.App._whenReadies.length > 0) {
                $(app.App._whenReadies[0][0]).whenReady(app.App._whenReadies[0][1]);
                app.App._whenReadies.shift();
            }

            while( this.Class._readyCallbacks.length > 0 ){

                var item = this.Class._readyCallbacks.shift();

                if( undefined === item.callback || typeof item.callback !== "function" ) continue;

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
    });

    return app.App;
});

