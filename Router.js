/**
 * App Router module
 *
 * Simple url routing system
 *
 * @example
 *
 *  App.Route.add( /^sad\/?([0-9]+)?$/g, 'regular' )
 *  App.Route.add( 'sad/2', 'happy' );
 *
 *  var res = App.Route.match( 'sad/2' );
 *
 *  res = [
 *      happy:[],
 *      regular: [ 0: 2 ]
 * ]
 *
 * @author Andrew Tereshko <andrew.tereshko@gmail.com>
 * @version 0.2.1
 */
define( ['./Hub', './Logger', './State'], function( Hub, Logger, State ) {
    //"use strict";

    $.Class.extend("app.Route",
    /* @static */
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
         * Get current state path
         *
         * @deprecated since 0.3.2, now yam.State.current().location must be used
         *
         * @returns {String}
         */
        getCurrentPath: function() {

            return State.current().location;
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

                var sc = hash[0].indexOf("["), cs = hash[0].indexOf("]");

                if( sc > 0 && cs > 0 ) {

                    var paramName = hash[0].substr( 0, sc );

                    if( hash[0].charAt( sc+1 ) == "]" ) {

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
        buildParamsString: function( params )
        {
            return decodeURIComponent( $.param( params ) );
        }
    },

    /* @prototype */
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

    return app.Route;
});

