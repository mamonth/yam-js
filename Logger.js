/**
 * App Logger module
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @author Andrew Tereshko <andrew.tereshko@gmail.com>
 * @version 0.3
 */
define( function () {
    'use strict';

    // Check if yam "namespace" exists
    if( !window.yam ) window.yam = {};

    // prepend local console link
    var _stub       = function(){},
        _ie         = navigator.userAgent.indexOf('MSIE') != -1,
        _console    = window.console ? window.console : { log: _stub, debug: _stub, info: _stub, warn: _stub, error: _stub };

    /**
     * @class yam.Logger
     *
     * @type {Object}
     */
    yam.Logger = {

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
        level   : 1
    };

    // Short link
    var Logger = yam.Logger;


    Logger.log      = function () {
        if( Logger.level >= Logger.LOG ) Logger._echo( arguments, 'log' );
    }

    Logger.debug    = function () {
        if( Logger.level >= Logger.DEBUG ) Logger._echo( arguments, 'debug' );
    }

    Logger.info     = function () {
        if( Logger.level >= Logger.INFO ) Logger._echo( arguments, 'info' );
    }

    Logger.warn     = function () {
        if( Logger.level >= Logger.WARN ) Logger._echo( arguments, 'warn' );
    }

    Logger.error    = function () {
        if( Logger.level >= Logger.ERROR ) Logger._echo( arguments, 'error' );
    }

    /**
     * @deprecated ( Very odd method )
     */
    Logger.tLog     = function () {
        if ( (Logger.level >= Logger.LOG || Logger.timing) && Logger.ie ){
            _console["log"].apply( _console, Logger._parseArgs(arguments));
        }
    }

    Logger._parseArgs   = function () {
        var args    = Array.prototype.slice.call( arguments[0]),
            isClass = typeof args[0] == 'object' && args[0].constructor.fullName;//@todo - replace this by interface check

        return ([ isClass ? '[' + args[0].constructor.fullName + ']' : args[0]].concat(args.slice(1)));
    }

    Logger._echo    = function (args, type) {
        var args = Logger._parseArgs(args);

        /*@cc_on _ie = true; @*/

        if (Logger.debug && window.console && window.console[type]) {
            if ( _ie) {
                console[type](args.join(' '));
            } else {
                console[type].apply(console, args);
            }
        }
    }

    //backward compatibility
    if( !window.app ) window.app = {};
    window.app.Logger = yam.Logger;

    return Logger;
});

