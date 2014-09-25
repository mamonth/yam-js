/**
 * Yam state handler
 *
 * Simple static state handler.
 *
 * @example
 *
 * @
 * @since 0.3.2
 *
 * @author Andrew Tereshko <andrew.tereshko@gmail.com>
 */
(function( factory ) {

    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery','jquery-class'], factory);
    } else if (typeof exports === 'object') {

        var Class   = require('jquery-class'),
            jQuery  = require('jquery');

        // CommonJS
        module.exports = factory( jQuery, Class );
    } else {
        // Browser globals
        factory( jQuery, jQuery.Class );
    }

}( function( $, Class ) {
    'use strict';

    /**
     * @class yam.State
     * @extends jQuery.Class
     */
    Class.extend('yam.State',
        /* @static */
        {
            /**
             * Stack of states
             *
             * @private
             * @property {Array}
             */
            _stack: [],

            /**
             * Position of current state in stack;
             *
             * @private
             * @property {Number}
             */
            _currentKey: 0,

            /**
             * Returns current state
             *
             * @return {yam.State}
             */
            current: function(){

                var state;

                if( undefined !== this._stack[ this._currentKey ] ){

                    state = this._stack[ this._currentKey ];

                } else {
                    state = new this();
                }

                return state;
            },

            /**
             * Create and push new state to stack ( and make it current ).
             *
             * @param {yam.State|string} location
             * @param {object} [data]
             * @param {string} [title]
             */
            push: function( location, data, title ){

                var state = ( location instanceof this ) ? location : new this( location, data, title );

                if( this._stack.length ){ this._currentKey++; }

                this._stack.splice( this._currentKey );

                this._stack.push( state );

                $(this)
                    .trigger( 'locationChange', state )
                    .trigger( 'push', state );
            },

            /**
             * Replaces current state
             *
             * @param {yam.State|string} location
             * @param {object} [data]
             * @param {string} [title]
             */
            replace: function( location, data, title ){

                var state = ( location instanceof this ) ? location : new this( location, data, title );

                this._stack[ this._currentKey ] = state;

                $(this)
                    .trigger( 'locationChange', state )
                    .trigger( 'replace', state );
            },

            /**
             * Rewinds state to N steps backward
             *
             * @param {Number} steps
             */
            back: function( steps ){

                steps = ( !steps || isNaN( steps ) ) ? 1 : Math.min( steps, this._currentKey );

                if( this._currentKey ){

                    this._currentKey = this._currentKey - steps;

                    $(this)
                        .trigger( 'locationChange', this.current() )
                        .trigger( 'back', this.current() );
                }
            },

            /**
             * Rewinds state to N steps forward
             *
             * @param {Number} steps
             */
            forward: function( steps ){

                steps = ( !steps || isNaN( steps ) ) ? 1 : Math.min( steps, this._stack.length - ( this._currentKey + 1 ) );

                if( this._currentKey < this._stack.length ){

                    this._currentKey = this._currentKey + steps;

                    $(this).trigger( 'locationChange', this.current() );
                    $(this).trigger( 'forward', this.current() );
                }
            }
        },
        /* @prototype */
        {
            /**
             * @property {String}
             */
            location    : '',

            /**
             * @property {String}
             */
            title       : '',

            /**
             * @property {Object|undefined}
             */
            data        : null,

            /**
             * @constructor
             *
             * @param {String} location
             * @param {Object} [data]
             * @param {String} [title]
             */
            init: function( location, data, title ){

                this.location   = location;
                this.data       = data || {};
                this.title      = title || '';
            }
        }
    );

    return yam.State;
}));
