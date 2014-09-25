/**
 * App Router module
 *
 * Simple url routing system
 *
 * @example
 *
 *  yam.Route.add( /^sad\/?([0-9]+)?$/g, 'regular' )
 *  yam.Route.add( 'sad/2', 'happy' );
 *
 *  var res = yam.Route.match( 'sad/2' );
 *
 *  res = [
 *      happy:[],
 *      regular: [ 0: 2 ]
 * ]
 *
 * @author Andrew Tereshko <andrew.tereshko@gmail.com>
 * @version 0.2.1
 */
(function( factory ) {

    if (typeof define === 'function' && define.amd) {
        // AMD
        define( ['jquery','jquery-class', './Logger', './State'], factory );
    } else if (typeof exports === 'object') {

        var Class   = require('jquery-class'),
            Logger  = require('./Logger'),
            State   = require('./State'),
            jQuery  = require('jquery');

        // CommonJS
        module.exports = factory( jQuery, Class, Logger, State );
    } else {
        // Browser globals
        factory( jQuery, jQuery.Class, yam.Logger, yam.State );
    }

}( function( $, Class, Logger, State ) {
    'use strict';

    /**
     * @class yam.Route
     * @extends jQuery.Class
     */
    Class.extend('yam.Route',
    /** @static **/
    {
        _rules: [],

        /**
         * Add rule
         *
         * @param rule
         * @param name
         */
        add: function( rule, name )
        {
            this._rules.push( new this( rule, name ) )
        },

        /**
         * Match path with rules, return matched
         *
         * @param path
         * @returns {object}
         */
        match: function( path )
        {
            if( !path ) {
                path = State.current().location;
            }

            var result = {}, rulesCount = this._rules.length;

            for( var i = 0; i < rulesCount; i++ ) {

                if ( result[ this._rules[i].name ] === undefined ) {

                    var params = this._rules[i].match( path );

                    if ( params !== false ) {
                        result[ this._rules[i].name ] = params;
                    }
                }
            }

            return result;
        },

        /**
         * Retrieve and parse GET parameters string
         *
         * @returns {Object}
         */
        getParams: function() {

            var params = {}, hash;

            var hashes = this.getParamsString().split('&');

            var i = hashes.length;
            while( i-- )
            {
                if( ! hashes[ i ] ) continue;

                hash = hashes[ i ].split('=');

                if( !hash[0] ) continue;

                var sc = hash[0].indexOf('['), cs = hash[0].indexOf(']');

                if( sc > 0 && cs > 0 ) {

                    var paramName = hash[0].substr( 0, sc );

                    if( hash[0].charAt( sc+1 ) == ']' ) {

                        if( !params[ paramName ] ) { params[ paramName ] = [] }

                        params[ paramName ].push( hash[1] );
                    }
                    else {
                        if( !params[ paramName ] ) { params[ paramName ] = {} }

                        var paramPart = hash[0].substr( sc + 1, cs - sc - 1 );

                        params[ paramName ][ paramPart ] = hash[1];
                    }
                }
                else {
                    params[ hash[0] ] = hash[1] || '';
                }
            }

            return params;
        },

        getParamsString: function()
        {
            // @TODO cut off History depency
            var url = window.History.getState().url, paramsPos = url.indexOf('?');

            if( paramsPos > 0 && paramsPos + 1 < url.length )
            {
                return url.slice( paramsPos + 1 );
            }

            return '';
        },

        /**
         * @deprecated since 0.3.2, when History and browser related methods was removed
         *
         * @param index
         * @returns {String}
         */
        extractChunkURI: function( index ) {

            var uri   = State.current().location,
                chunk = undefined;

            if(!isNaN(index)) {
                if(typeof uri === 'string' && uri.length > 0) {
                    if(uri.indexOf('/') >= 0) {
                        var chunks = uri.split('/');

                        if(chunks.length >= parseInt(index)) {
                            chunk = chunks[parseInt(index)];
                        }
                    }
                }
            }

            return chunk;
        },

        /**
         * Construct GET parameters string from object.
         *
         * @param params
         * @returns {string}
         */
        buildParamsString: function (data, traditional, noArrayKeys) {
            var s = [],
                rbracket = /\[\]$/,
                r20 = /%20/g,

                encode = function (value, encoded) {
                    return encoded ? value : encodeURIComponent(value);
                },

                add = function (key, value, keyEncoded) {

                    if( $.isFunction(value) ) return;

                    if( typeof value == 'undefined' || value === null ) value = '';

                    s[s.length] = encode(key, keyEncoded) + '=' + encode(value);
                },

                buildParams = function (key, data, traditional, add, keyEncoded) {
                    if (jQuery.isArray(data)) {
                        data.forEach( function ( v, i ) {
                            if (traditional || rbracket.test(key)) {
                                add(key, v);

                            } else {
                                buildParams(encode(key, keyEncoded) + '[' + (!noArrayKeys && (typeof v === "object" || jQuery.isArray(v)) ? i : '') + ']', v, traditional, add, true);
                            }
                        });

                    } else if (data !== null && typeof data === 'object') {
                        for( var name in data ){
                            if( name.match( /jQuery[0-9]+/ig ) ) return;

                            buildParams(encode(key, keyEncoded) + '[' + encode(name) + ']', data[name], traditional, add, true);
                        }

                    } else {
                        add(key, data, keyEncoded);
                    }
                };

            // Set traditional to true for jQuery <= 1.3.2 behavior.
            if (traditional === undefined) {
                traditional = $.ajaxSettings.traditional;
            }

            if ( $.isArray(data) || (data.jquery && !$.isPlainObject(data))) {
                $.each(data, function () {
                    add(this.name, this.value);
                });

            } else {

                for( var key in data){
                    buildParams(key, data[key], traditional, add);
                }
            }

            return s.join('&').replace(r20, '+');
        }
    },

    /** @prototype **/
    {
        /**
         * Route name
         */
        name: null,

        /**
         * Route rule ( can be string or regexp )
         */
        rule: null,

        /**
         * Constructor
         *
         * @param rule
         * @param name
         */
        init: function( rule, name )
        {
            this.name = name;

            this.rule = rule;
        },

        /**
         * Match self rule with path.
         *
         * @param path
         * @returns {boolean}
         */
        match: function( path )
        {
            var params = false, matches, key;

            if ( this.rule instanceof RegExp )
            {
                matches = this.rule.exec( path );

                if( matches )
                {
                    params = [];

                    for( key = 1; key <= matches.length; key++ )
                    {
                        if( matches[ key ] !== undefined ) params.push( matches[ key ] );
                    }
                }
            }
            else if ( path == this.rule )
            {
                params = [];
            }

            return params;
        }
    });

    return yam.Route;
}));
