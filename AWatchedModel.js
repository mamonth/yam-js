/**
 * Abstract Watched model class
 *
 * @version 0.3.0
 */
define("app/AWatchedModel", ["app/Observable","app/ModelWatcher","app/ModelList","app/AModel"], function () {

    "use strict";

    /**
     * @class app.Model
     */
    app.AModel.extend("app.AWatchedModel",
        /*@static*/
        {
            create: function(data){

                if ( ( data instanceof Object ) && ( data.id !== undefined )) {

                    if( !app.ModelWatcher.has( this, data.id ) ) {

                        return new this(data);

                    } else {

                        return app.ModelWatcher.get( this, data.id );
                    }
                }

            }
        },
        /*@prototype*/
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


