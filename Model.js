/**
 * Abstract model class
 *
 * @author Andrew Tereshko <andrew.tereshko@gmail.com>
 * @version 0.3.0
 */
define("app/Model", ["app/ModelWatcher"], function () {

    "use strict";

    $.Class.extend("app.Model",
        /*@static*/
        {
            /**
             * An utility method for determine identity property
             *
             * @return {string|array}
             */
            getIdentity: function(){
                return 'id';
            },
            get: function ( identity ) {

                // Prepare troops
                var deferred = $.Deferred();

                if ( !app.ModelWatcher.isset( this.fullName, identity ) ) {

                    // here comes request (ajax or something...)
                    // don't forget to resolve deferred object ( or you will make him sad )

                }

                // Landing
                return deferred.promise();
            },
            getList: function () {
                // just as example, Mostly same as get()
            },
            _getMethodEnding: function (varName) {

                return varName.charAt(0).toUpperCase() + varName.substr(1, v.length - 1);

            }

        },
        /*@prototype*/
        {
            setup: function () {

                var self = this;

                for ( var variable in this ) {

                    if ( typeof this[variable] === "function" ) continue;

                    if (variable.charAt(0) == '_') continue;

                    var methodEnding = this.Class._getMethodEnding(variable);

                    // make getter if not exists
                    if (undefined === this[ "get" + methodEnding ]) {

                        this[ "get" + methodEnding ] = function () {
                            return self[variable];
                        };

                    }

                    //making setter if not exists
                    if (undefined === this[ "set" + methodEnding ]) {

                        this[ "set" + methodEnding ] = function (value) {

                            self[variable] = value;

                            self.observable.notify(variable);

                            return true;
                        };

                    }
                }

            },
            init: function (values) {

                for (var param in values) {

                    var setter = "set" + this.Class._getMethodEnding( param );

                    if (undefined === this[ setter ] || typeof this[setter] !== "function") continue;

                    this[setter]( values[ param ] );
                }
            },
            id:undefined
        }
    );
});


