/**
 * App Deferred Module Abstract Class
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.2.1
 */
define("app/ADeferredModule", ["app/Hub", "app/Logger", "app/IModule"], function (Hub, Logger, IModule) {
    "use strict";

    app.IModule.extend("app.ADeferredModule",
        /* @prototype */
        {
            _readyCallbacks: undefined,
            setup: function(){
                this._readyCallbacks = [];
            },
            onReady: function ( callback, runOnce ) {

                runOnce = runOnce === undefined ? true : runOnce;

                if( typeof callback !== "function" ) throw new Error("callback must be function");

                this._readyCallbacks.push({ runOnce: runOnce, callback: callback });
            },
            setReady: function(){

                var len = this._readyCallbacks.length;

                while( len-- ) {

                    if( this._readyCallbacks[len].callback !== undefined && typeof this._readyCallbacks[len].callback == "function" ) {
                        this._readyCallbacks[len].callback();
                    }

                    if( this._readyCallbacks[len].runOnce !== false ) {
                        this._readyCallbacks.splice(len, 1);
                    }

                }

            }

        });

    return app.ADeferredModule;
});

