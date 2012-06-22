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
define("app/Router", ["app/Hub", "app/Logger"], function(Hub, Logger) {
    //"use strict";

    $.Class.extend("app.Route",
    /* @static */
    {
        _rules: [],

        add: function( rule, name )
        {
            this._rules.push( new this( rule, name ) )
        },

        match: function( path )
        {
            if( !path ) {
                path = this.getCurrentPath();
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

        getCurrentPath: function()
        {
            var path = window.History.getState().url.replace( /^https?:\/\/[^\/]+\//, '' );

            path = path.replace( /\?([^#\?]+)?/g, '' );

            path = path.replace( /(#|#!).*/, "/" );

            // Remove slash duplicates
            path = path.replace( /\/+/, '/' );

            return path;
        },

        getParams: function()
        {
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
            var paramsPos = window.History.getState().url.indexOf('?');

            if( paramsPos > 0 && paramsPos + 1 < window.History.getState().url.length )
            {
                return window.History.getState().url.slice( paramsPos + 1 );
            }

            return '';
        },

        buildParamsString: function( params )
        {
            var paramsString = '';

            for( variable in params ) {

                if ( params[ variable ] instanceof Array ) {

                    var len = params[ variable ].length;

                    while( len-- ) {
                        paramsString = paramsString + ( paramsString.length ? '&' : '' ) + variable + '[]=' + params[ variable ][ len ];
                    }
                }
                else if ( typeof params[ variable ] == "object" ) {

                    for( var param in params[ variable ] ) {

                        paramsString += ( paramsString.length ? '&' : '' ) + variable + "[" +  param + "]=" + params[ variable ][ param ];

                    }

                }
                else {

                    paramsString = paramsString + ( paramsString.length ? '&' : '' ) + variable + '=' + params[ variable ];
                }

            };

            return paramsString;
        }
    },

    /* @prototype */
    {
        name: null,
        rule: null,

        init: function( rule, name )
        {
            this.name = name;

            this.rule = rule;
        },

        match: function( path )
        {
            var params = false, matches, key;

            if ( this.rule instanceof RegExp )
            {
                matches = this.rule.exec( path );

                if( matches )
                {
                    params = []

                    for( key = 1; key <= matches.length; key++ )
                    {
                        params.push( matches[ key ] );
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

