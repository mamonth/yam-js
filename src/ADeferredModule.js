/**
 * App Deferred Module Abstract Class
 *
 * @author Andrew Tereshko <andrew.tereshko@gmail.com>
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.4.4
 */
define( 'yam/ADeferredModule', ['yam/IModule'], function ( IModule ) {
    'use strict';

    /**
     * @class yam.ADeferredModule
     * @extends yam.IModule
     */
    return IModule.extend('yam.ADeferredModule',
        /** @prototype **/
        {
            _readyCallbacks: null,

            setup: function(){
                this._readyCallbacks = [];
            },

            onReady: function ( callback, runOnce ) {

                runOnce = runOnce === undefined ? true : runOnce;

                if( typeof callback !== 'function' ) throw new Error('callback must be function');

                this._readyCallbacks.push({ runOnce: runOnce, callback: callback });
            },

            setReady: function(){

                var len = this._readyCallbacks.length;

                while( len-- ) {

                    if( this._readyCallbacks[len].callback !== undefined && typeof this._readyCallbacks[len].callback == 'function' ) {
                        this._readyCallbacks[len].callback();
                    }

                    if( this._readyCallbacks[len].runOnce !== false ) {
                        this._readyCallbacks.splice(len, 1);
                    }
                }
            }

        });
});
