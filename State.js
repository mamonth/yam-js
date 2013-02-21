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
define( function() {
    "use strict";

    /**
     * @class yam.State
     */
    $.Class.extend('yam.State',
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
             * @property {Numeric}
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
             * @param location
             * @param data
             * @param title
             */
            push: function( location, data, title ){

                var state = new this( location, data, title );

                this._stack.push( state );

                if( this._currentKey > 0 ){ this._currentKey++; }

                $(this)
                    .trigger( 'locationChange', state )
                    .trigger( 'push', state );
            },

            /**
             * Replaces current state
             *
             * @param location
             * @param data
             * @param title
             */
            replace: function( location, data, title ){

                var state = new this( location, data, title );

                this._stack[ this._currentKey ] = state;

                $(this)
                    .trigger( 'locationChange', state )
                    .trigger( 'replace', state );
            },

            /**
             * Rewinds state to N steps backward
             *
             * @param steps
             */
            back: function( steps ){
                if( steps === undefined ) steps = 1;


                $([this]).trigger( 'change', state );
                $([this]).trigger( 'back', state );
            },

            /**
             * Rewinds state to N steps forward
             *
             * @param steps
             */
            forward: function( steps ){
                if( steps === undefined ) steps = 1;


                $([this]).trigger( 'change', state );
                $([this]).trigger( 'forward', state );
            }
        },
        /* @prototype */
        {
            location    : '',
            title       : '',
            data        : undefined,

            /**
             * @constructor
             *
             * @param location
             * @param data
             * @param title
             */
            init: function( location, data, title ){

                this.location   = location;
                this.data       = data || {};
                this.title      = title || '';
            }
        }
    );


    // backward compatibility
    if( app === undefined ) app = {};
    app.State = yam.State;

    return yam.State;
});
