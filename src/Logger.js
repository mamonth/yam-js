/**
 * App Logger module
 *
 * @author Andrew Tereshko <andrew.tereshko@gmail.com>
 */
define('yam/Logger', ['jquery-class'], function ( Class ) {
    'use strict';

    // prepend local console link
    var _stub       = function(){},
        _ie         = typeof navigator !== 'undefined' && navigator.userAgent.indexOf('MSIE') != -1,
        _console    = console ? console : { log: _stub, debug: _stub, info: _stub, warn: _stub, error: _stub };

    /**
     * @class yam.Logger
     * @extends jQuery.Class
     *
     */
    return Class.extend('yam.Logger',
        /** @static **/
        {
            /**
             * Log levels
             */
            NONE    : 0,
            ERROR   : 1,
            WARN    : 2,
            INFO    : 3,
            DEBUG   : 4,
            LOG     : 5,

            /**
             * Current log level
             */
            level   : 1,

            log     : function () {

                if( this.level >= this.LOG ) this._echo( arguments, 'log' );
            },

            debug   : function () {

                if( this.level >= this.DEBUG ) this._echo( arguments, 'debug' );
            },

            info    : function () {

                if( this.level >= this.INFO ) this._echo( arguments, 'info' );
            },

            warn    : function () {

                if( this.level >= this.WARN ) this._echo( arguments, 'warn' );
            },

            error   : function () {

                if( this.level >= this.ERROR ) this._echo( arguments, 'error' );
            },

            _parseArgs  : function () {

                var args    = Array.prototype.slice.call( arguments[0] ),
                    isClass = args[0] instanceof Class;

                return ([ isClass ? '[' + args[0].constructor.fullName + ']' : args[0] ].concat( args.slice(1) ) );
            },

            _echo   : function (args, type) {

                var args = this._parseArgs(args);

                if ( _ie) {
                    _console[type]( args.join(' ') );
                } else {
                    _console[type].apply(console, args);
                }
            }
        },
        {
        }
    );

});
