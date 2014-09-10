/**
 * Routed module interface
 *
 * @author Andrew Tereshko <andrew.tereshko@gmail.com>
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.2.1
 */
define( function() {
    'use strict';

    /**
     * Module interface (well... sort of)
     * Defines common module structure for yam-js framework.
     *
     * @class yam.IModule
     * @extends jQuery.Class
     */
    $.Class.extend( 'yam.IModule',
        {
            /**
             * Constructor.
             * Executed once, when module match route. Can be omitted, since has implementation in jQuery.Class.
             */
            init: function() {
            },

            /**
             * Main enter point for module.
             * Executed each time event 'changestate' fires, and module match route.
             *
             * @param {{Array}} params - Array of route defined variables ( i.e. groups when route is regexp )
             */
            run: function( params ) {
                throw new Error( this.constructor.fullName + ": method run must be implemented.");
            },

            /**
             * Cleanup method.
             * Executed when module doesn't match route anymore.
             */
            destruct: function() {
                throw new Error(this.constructor.fullName + ": method destruct must be implemented");
            }
        }
    );

    //backward compatibility
    if(!window.app) window.app = {};
    window.app.IModule = yam.IModule;

    return yam.IModule;
});

