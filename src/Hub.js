/**
 * Subscribe/publication hub
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @author Andrew Tereshko <andrew.tereshko@gmail.com>
 * @version 0.2.1
 */
(function( factory ) {

    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery','jquery-class', './Logger'], factory);
    } else if (typeof exports === 'object') {

        var Class   = require('jquery-class'),
            Logger  = require('./Logger'),
            jQuery  = require('jquery');

        // CommonJS
        module.exports = factory( jQuery, Class, Logger );
    } else {
        // Browser globals
        factory( jQuery, jQuery.Class, yam.Logger );
    }

}( function ( $, Class, Logger ) {
    'use strict';

    /**
     * @class yam.Hub
     * @extends jQuery.Class
     */
    Class.extend('yam.Hub',
        /** @static **/
        {
            _nSpace     : '.yam',
            _domNode    : $('<i/>'),
            stack       : {},
            channels    : {},

            pub: function (channel, data, ignoreListener ) {
                data = data || {};
                ignoreListener = ignoreListener === true ? true : false;

                if( typeof this.stack[channel] == 'undefined' ){
                    this.stack[channel] = [];
                }

                if( !this.channels[channel] && !ignoreListener ){

                    this.stack[channel].push(data);
                    //this.stack[channel] = _.uniq(this.stack[channel]);
                    Logger.warn( this, 'Push channel "' + channel + '" to stack',data );

                } else {

                    this._pub(channel, data);
                }

            },

            _pub: function (channel, data) {

                Logger.info( this, 'Publish to channel "' + channel + '"', data);

                this._domNode.trigger.apply(this._domNode, arguments);
            },

            sub: function (channel, callback) {

                this.channels[channel] = true;
                Logger.info( this, 'Subscribed to channel "' + channel + '"' );

                function wrapper( event, data) {
                    return callback.call(this, data, event );
                }

                wrapper.guid = callback.guid = callback.guid || ($.guid ? $.guid++ : $.event.guid++);

                this._domNode.bind( channel + this._nSpace, wrapper);

                if( this.stack[channel] ){

                    for(var i in this.stack[channel]){

                        Logger.warn( this, 'get channel "' + channel + '" from stack',i, this.stack[channel]);

                        this._pub(channel, this.stack[channel][i]);
                    }

                    delete(this.stack[channel]);
                }
            },

            unsub: function (channel, callback) {

                Logger.info( this, 'Unsubscribed from channel "' + channel + '"');

    //            delete(this.channels[channel]);
                if( undefined === callback ){
                    this._domNode.unbind(channel + this._nSpace );
                } else if( typeof callback == 'function'){
                    this._domNode.unbind(channel + this._nSpace, callback);
                } else if( typeof callback == 'object' && callback.type !== undefined ){
                    this._domNode.unbind( callback );
                }

            }
        },
        /** @prototype **/
        {
        }
    );

    return yam.Hub;
}));
