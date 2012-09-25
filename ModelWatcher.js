/**
 * Model Watcher
 *
 * @author Andrew Tereshko <andrew.tereshko@gmail.com>
 * @version 0.3.0
 */

define("app/ModelWatcher", [ /* "app/Model" */ ], function () {

    "use strict";

    /* experimenting on js exception handle */
    window.InvalidArgumentException = function( message ){
        this.message = message || "";
    };
    window.InvalidArgumentException.prototype = new Error();
    window.InvalidArgumentException.prototype.constructor = window.InvalidArgumentException;
    window.InvalidArgumentException.prototype.name = 'InvalidArgumentException';

    /**
     * @class app.ModelWatcher
     */
    $.Class.extend("app.ModelWatcher",
        /* @static */
        {
            /**
             * Object
             */
            _storage: {},

            /**
             * Register model instance to watcher
             *
             * @param {app.AModel} modelInstance
             */
            register: function( modelInstance ){

                if( !( modelInstance instanceof app.AModel ) || undefined === modelInstance.Class.fullName )
                    throw new InvalidArgumentException( this.fullName + " can handle only app.AModel instances");

                var identity = modelInstance.getIdentityValue();

                if( this.has( modelInstance.Class, identity ) )
                    throw new Error( modelInstance.Class.fullName + " instance with identity " + identity + " already registered");

                if( undefined === this._storage[ modelInstance.Class.fullName ] )
                    this._storage[ modelInstance.Class.fullName ] = {};

                this._storage[ modelInstance.Class.fullName ][ identity ] = modelInstance;
            },

            /**
             * Check if model instance already registered
             *
             * @param classDef
             * @param identity
             */
            has: function( classDef, identity ){

                if( undefined === classDef.fullName )
                    throw new InvalidArgumentException( this.fullName + " can handle only classes inherited from app.AModel ");

                return !( undefined === this._storage[ classDef.fullName ] || undefined === this._storage[ classDef.fullName ][ identity ] );
            },

            /**
             *
             * @param classDef
             * @param identity
             * @return {app.AModel}
             */
            get: function( classDef, identity ){

                if( undefined === classDef.fullName )
                    throw new InvalidArgumentException( this.fullName + " can handle only classes inherited from app.AModel.");


                return this.has( classDef, identity ) ? this._storage[ classDef.fullName ][ identity ] : undefined;
            },

            /**
             * @param {app.AModel} modelInstance
             */
            unregister: function( modelInstance ){

                if( ! this.has( modelInstance.Class, modelInstance.getIdentityValue() ) )
                    throw new InvalidArgumentException( "Model " + modelInstance.Class.fullName + " with id " + modelInstance.getIdentityValue() + " was not registered." );

                var storage = {};

                for( var identity in this._storage[ modelInstance.Class.fullName ] ){

                    if( identity == modelInstance.getIdentityValue() ) continue;

                    storage[ identity ] = this._storage[ modelInstance.Class.fullName ][ identity ];
                }

                this._storage[ modelInstance.Class.fullName ] = storage;
            }
        },
        {

        }
    );

});
