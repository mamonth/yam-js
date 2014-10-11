/**
 * Observable abstract realization
 *
 * Accept as observers regular function and objects with method "update"
 *
 * @author Andrew Tereshko <andrew.tereshko@gmail.com>
 * @version 0.3.0
 */
define( 'yam/Observable', ['jquery-class'], function ( Class ) {

    'use strict';

    /**
     * @class yam.Observable
     * @extends jQuery.Class
     */
    return Class.extend('app.Observable',
        /* @prototype */
        {
            /**
             * Set of attached observers by event
             */
            _attachedObservers: {},

            /**
             * Attaches observer function to object
             *
             * @example attach observer on specific object event
             * yam.Observable.attachObserver( 'event', function(){ } );
             *
             * @example attach observer on all object events
             * yam.Observable.attachObserver( function( e ){ alert(e) } );
             *
             * @param event
             * @param observer
             */
            attachObserver: function( event, observer ){

                if( arguments.length < 2 )
                {
                    observer = event;
                    event = '**WILDCARD**';
                }

                if( !(observer instanceof Object) && !(observer instanceof Function) ) {
                    return;
                }

                if( !this._attachedObservers[ event ] ) this._attachedObservers[ event ] = [];

                this._attachedObservers[ event ].push( observer );
            },

            /**
             * Detach observer function from object
             *
             * @example detach observer by specific object event
             * var foo = function (){};
             *
             * app.Observable.detachObserver( "event", foo );
             *
             * @example detach observer from all | any object events
             * var foo = function (){};
             *
             * app.Observable.detachObserver( foo );
             *
             * @param event
             * @param observer
             */
            detachObserver: function( event, observer ){

                if( arguments.length < 2 )
                {
                    observer = event;
                    event = null;
                }

                for( var e in this._attachedObservers ){

                    if( event !== null && e !== event ) continue;

                    var oLen = this._attachedObservers[ e ].length;

                    while( oLen-- ){

                        if( this._attachedObservers[ e ][ oLen ] === observer ){

                            this._attachedObservers[ e ].splice( oLen, 1 );
                        }
                    }

                }

            },

            /**
             * Notifies attached observers about some event
             *
             * @param event
             */
            notify: function( event ){

                if( !this._attachedObservers[ event ] || !this._attachedObservers[ event ].length ) {
                    return;
                }

                // Iterate over specific bindins
                var oLen = this._attachedObservers[ event ].length;

                while( oLen-- ){

                    this._notifyObserver( event, this._attachedObservers[i] );
                }

                // and don't forget observers that was applied to wildcard
                oLen = this._attachedObservers[ '**WILDCARD**' ].length;

                while( oLen-- ){

                    this._notifyObserver( event, this._attachedObservers[i] );
                }
            },
            /**
             * @private
             * @param event
             * @param observer
             */
            _notifyObserver: function( event, observer ){

                if( observer instanceof Function ){

                    observer( event, this );
                }
                else if( observer.update instanceof Function ){

                    observer.update( event, this );
                }

            }

        });

});
