/**
 * Routed module interface
 *
 * @author Andrew Tereshko <andrew.tereshko@gmail.com>
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.2.1
 */
(function( factory ) {

    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery-class'], factory);
    } else if (typeof exports === 'object') {

        var Class = require('jquery-class');

        // CommonJS
        module.exports = factory( Class );
    } else {
        // Browser globals
        factory( jQuery.Class );
    }

}( function( Class ) {
    'use strict';

    /**
     * Module interface (well... sort of)
     * Defines common module structure for yam-js framework.
     *
     * @class yam.IModule
     * @extends jQuery.Class
     */
    Class.extend( 'yam.IModule',
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

    return yam.IModule;
}));
