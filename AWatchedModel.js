/**
 * Abstract Watched model class
 *
 * @version 0.3.0
 */
define("app/AWatchedModel", ["app/Observable","app/ModelWatcher","app/ModelList","app/AModel"], function () {

    "use strict";

    /**
     * @class app.AWatchedModel
     */
    app.AModel.extend("app.AWatchedModel",
        /* @static */
        {
            create: function(data){

                if ( ( data instanceof Object ) && ( data.id !== undefined )) {

                    if( !app.ModelWatcher.has( this, data.id ) ) {

                        return new this(data);

                    } else {

                        return app.ModelWatcher.get( this, data.id );
                    }
                }

            },

            update: function ( data ) {

                //make some paranoia
                if ( data instanceof Object && data.id !== undefined ){

                    if ( app.ModelWatcher.has( this, data.id ) ){

                        var model = app.ModelWatcher.get( this, data.id );

                        for (var param in data) {

                            var setter = "set" + model.Class._getMethodEnding( param );

                            if (undefined === model[ setter ] || typeof model[setter] !== "function") continue;

                            model[setter]( data[ param ] );
                        }

                    }

                }

            },
            factory: function( data ) {

                var model = app.ModelWatcher.has( this, data.id ) ? app.ModelWatcher.get( this, data.id ) : new this();

                if ( ( data instanceof Object ) )
                {
                    model.fill( data );
                }

                return model;
            }

        },
        /* @prototype */
        {

            init: function (values) {


                this._super( values );

                // if available identity property - register model
                if( undefined !== this[ this.Class.getIdentity() ] ){

                    app.ModelWatcher.register( this );
                }
            }

        }
    );
});


