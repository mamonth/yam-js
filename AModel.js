/**
 * Abstract model class
 *
 * @author Andrew Tereshko <andrew.tereshko@gmail.com>
 * @version 0.3.0
 */
define("app/AModel", ["app/Observable","app/ModelWatcher","app/ModelList"], function () {

    "use strict";

    /**
     * @class app.AModel
     */
    app.Observable.extend("app.AModel",
        /* @static */
        {
            properties: [],

            /**
             * Setup method, MUST NOT BE OVERWRITTEN !
             *
             * Prepare getter \ setter methods
             *
             */
            setup: function( baseClass, fullName, staticProps, protoProps ){

                for ( var variable in protoProps ) {
                    this._createGetSetFor( variable );
                }

            },

            /**
             * An utility method for determine identity property
             *
             * @return {String|Array}
             */
            getIdentity: function(){
                return 'id';
            },

            /**
             * Example method to retrieve single model from storage
             *
             * @param {Number} identity
             * @return jQuery.Promise
             */
            get: function ( identity ) {

                // Prepare troops
                var deferred = $.Deferred();

                if ( !app.ModelWatcher.has( this, identity ) ) {

                    // here comes request (ajax or something...)
                    // don't forget to resolve deferred object ( or you will make him sad )
                }

                // Landing
                return deferred.promise();
            },

            /**
             * Example method to retrieve model collection from storage
             *
             * @param {Array} identityArray
             * @return jQuery.Promise
             */
            getList: function ( identityArray ) {
                // just as example, Mostly same as get()

                    var deferred = $.Deferred();

                    return deferred.promise();
            },

            /**
             * Private utility method
             *
             * @param varName
             */
            _getMethodEnding: function (varName) {
                return varName.charAt(0).toUpperCase() + varName.substr(1, varName.length - 1);
            },

            _createGetSetFor: function( variable ){

                if ( typeof this.prototype[variable] === "function" ) return;

                if ( variable.charAt(0) == '_' ) return;

                var methodEnding = this._getMethodEnding( variable );

                // make getter if not exists
                if ( undefined === this.prototype[ "get" + methodEnding ] ) {

                    this.prototype[ "get" + methodEnding ] = function () {
                        return this[ variable  ];
                    };
                }

                //making setter if not exists
                if ( undefined === this.prototype[ "set" + methodEnding ] ) {

                    this.prototype[ "set" + methodEnding ] = function (value) {

                        return this._set( variable, value );

                    };

                }

                // store to properties array
                this.properties.push( variable );

            },
            factory: function( data ) {

                var model = new this();

                if ( ( data instanceof Object ) )
                {
                    model.fill( data );
                }

                return model;
            }

        },
        /* @prototype */
        {
            /**
             * base identity property
             */
            id:undefined,

            /**
             * Array modified properties.
             */
            _modifiedProperties: undefined,

            /**
             * Class constructor
             *
             * @see fill method
             *
             * @param values
             */
            init: function ( values ) {

                this.fill( values );

            },

            /**
             * Param values must be object with param : value pairs
             * By default - values will be assigned to new object properties through setters
             * @param values
             */
            fill: function( values ) {

                for (var param in values) {

                    var setter = "set" + this.Class._getMethodEnding( param );

                    if (undefined === this[ setter ] || typeof this[setter] !== "function") continue;

                    this[setter]( values[ param ] );
                }
            },

            /**
             * Gets value of identity property
             *
             * @return {String}
             */
            getIdentityValue: function(){
                return this[ this.Class.getIdentity() ] !== undefined ? this[ this.Class.getIdentity() ] : undefined;
            },

            /**
             * Observable realisation
             *
             * @param variable
             * @param value
             * @param oldValue
             * @private
             */
            _triggerProperty: function( variable, value, oldValue ){

                $( [this] ).triggerHandler( "propertyChange", { path: variable, value: value, oldValue: oldValue } );

                //$( this ).triggerHandler( "objectChange", { property: variable, value: value, oldValue: oldValue } );

                //console.log( "triggered", "propertyChange", { path: variable, value: value, oldValue: oldValue } );
            },

            /**
             * Base setter
             *
             * @param variable
             * @param value
             * @returns {boolean}
             * @private
             */
            _set: function( variable, value ){

                var oldValue = this[ variable ];
                this[ variable ] = value;

                // If oldValue is not undefined, then property has been modified early.
                // And we must save name of modified variable.
                if( oldValue !== undefined ) {
                    if( this._modifiedProperties instanceof Array ) {
                        this._modifiedProperties.push( variable );
                    } else {
                        this._modifiedProperties = [ variable ];
                    }
                }

                this._triggerProperty( variable, value, oldValue );

                return true;

            },

            /**
             * Get array of modified properties.
             *
             * @return {Array}
             */
            getModifiedProperties: function() {
                return ( this._modifiedProperties instanceof Array ) ? this._modifiedProperties : [] ;
            },

            propertiesData: function(){

                var data = {},
                    propertyName;

                for( var len = this.Class.properties.length; len >= 0; --len ){

                    propertyName = this.Class.properties[ len ];

                    data[ propertyName ] = this[ propertyName ];
                }

                return data;
            }

        }
    );
});


