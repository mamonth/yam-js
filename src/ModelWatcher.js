/**
 * Model Watcher
 *
 * @author Andrew Tereshko <andrew.tereshko@gmail.com>
 * @version 0.3.0
 */
define( 'yam/ModelWatcher', ['jquery-class', 'yam/AModel'], function ( Class, AModel ) {

    'use strict';

    /* experimenting on js exception handle */
    window.InvalidArgumentException = function( message ){
        this.message = message || "";
    };
    window.InvalidArgumentException.prototype = new Error();
    window.InvalidArgumentException.prototype.constructor = window.InvalidArgumentException;
    window.InvalidArgumentException.prototype.name = 'InvalidArgumentException';

    /**
     * @class yam.ModelWatcher
     * @extends jQuery.Class
     */
    Class.extend('yam.ModelWatcher',
        /** @static **/
        {
            /**
             * Object
             */
            _storage: {},

            /**
             * Register model instance to watcher
             *
             * @param {yam.AModel} modelInstance
             */
            register: function( modelInstance ){

                if( !( modelInstance instanceof AModel ) || undefined === modelInstance.constructor.fullName )
                    throw new InvalidArgumentException( this.fullName + " can handle only yam.AModel instances");

                var identity = modelInstance.getIdentityValue();

                if( this.has( modelInstance.constructor, identity ) )
                    throw new Error( modelInstance.constructor.fullName + " instance with identity " + identity + " already registered");

                if( undefined === this._storage[ modelInstance.constructor.fullName ] )
                    this._storage[ modelInstance.constructor.fullName ] = {};

                this._storage[ modelInstance.constructor.fullName ][ identity ] = modelInstance;
            },

            /**
             * Check if model instance already registered
             *
             * @param classDef
             * @param identity
             */
            has: function( classDef, identity ){

                if( undefined === classDef.fullName )
                    throw new InvalidArgumentException( this.fullName + " can handle only classes inherited from yam.AModel ");

                return !( undefined === this._storage[ classDef.fullName ] || undefined === this._storage[ classDef.fullName ][ identity ] );
            },

            /**
             *
             * @param classDef
             * @param identity
             * @return {yam.AModel}
             */
            get: function( classDef, identity ){

                if( undefined === classDef.fullName )
                    throw new InvalidArgumentException( this.fullName + " can handle only classes inherited from app.AModel.");


                return this.has( classDef, identity ) ? this._storage[ classDef.fullName ][ identity ] : undefined;
            },


            //Возвращает ModelList
            getList: function( classDef, identityArr ){

                var coll = new app.ModelList( classDef );

                if ( identityArr instanceof Array && identityArr.length > 0){

                    for( var id in identityArr ){

                        var mdl = this.get(classDef, identityArr[ id ]);

                        if ( mdl !== undefined ) {
                            coll.push( mdl )
                        }

                    }

                } else if( identityArr === undefined ){

                    if (this._storage[ classDef.fullName ] instanceof Object){

                        for (var key in this._storage[ classDef.fullName ]){

                            if ( this._storage[ classDef.fullName ].hasOwnProperty( key ) &&
                                 typeof( this._storage[ classDef.fullName ][ key ] ) !== "function" &&
                                 this._storage[ classDef.fullName ][ key ] instanceof Object ){

                                coll.push( this._storage[ classDef.fullName ][ key ] );

                            }

                        }

                    }

                }

                return  coll;

            },
            /**
             * @param {yam.AModel} modelInstance
             */
            unregister: function( modelInstance ){

                if( ! this.has( modelInstance.constructor, modelInstance.getIdentityValue() ) )
                    throw new InvalidArgumentException( "Model " + modelInstance.constructor.fullName + " with id " + modelInstance.getIdentityValue() + " was not registered." );

                var storage = {};

                for( var identity in this._storage[ modelInstance.constructor.fullName ] ){

                    if( identity == modelInstance.getIdentityValue() ) continue;

                    storage[ identity ] = this._storage[ modelInstance.constructor.fullName ][ identity ];
                }

                this._storage[ modelInstance.constructor.fullName ] = storage;
            }
        },
        {

        }
    );

});
