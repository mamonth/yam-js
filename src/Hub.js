/**
 * Subscribe/publication hub
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @author Andrew Tereshko <andrew.tereshko@gmail.com>
 * @version 0.2.1
 */
define( ['./Logger'], function () {
    "use strict";

    /**
     * @class yam.Hub
     * @extends jQuery.Class
     */
    $.Class.extend('yam.Hub',
    /** @static **/
    {
        _domNode: $("<i/>"),
        stack:{},
        channels:{},
        pub: function (channel, data, ignoreListener ) {
            data = data || {};
            ignoreListener = ignoreListener === true ? true : false;

            if(typeof this.stack[channel] == "undefined"){
                this.stack[channel] = [];
            }
            if(!this.channels[channel] && !ignoreListener){
                this.stack[channel].push(data);
                //this.stack[channel] = _.uniq(this.stack[channel]);
                app.Logger.warn("Push channel '"+channel+"' to stack",data);
            }else{
                this._pub(channel, data);
            }

        },

        _pub: function (channel, data) {
            app.Logger.info("Publish to channel \"" + channel + "\"", data);
            this._domNode.trigger.apply(this._domNode, arguments);
        },
        sub: function (channel, callback) {
            this.channels[channel] = true;
            app.Logger.info("Subscribed to channel \"" + channel + "\"");

            function wrapper( event, data) {
                return callback.call(this, data, event );
            }

            wrapper.guid = callback.guid = callback.guid || ($.guid ? $.guid++ : $.event.guid++);

            this._domNode.bind(channel + ".app", wrapper);

            if(this.stack[channel]){
                for(var i in this.stack[channel]){
                    app.Logger.warn("get channel '"+channel+"' from stack",i, this.stack[channel]);

                    this._pub(channel, this.stack[channel][i]);

                }
                delete(this.stack[channel]);
            }
        },

        unsub: function (channel, callback) {
            app.Logger.info("Unsubscribed from channel \"" + channel + "\"");

//            delete(this.channels[channel]);
            if( undefined === callback ){
                this._domNode.unbind(channel + ".app" );
            } else if( typeof callback == "function"){
                this._domNode.unbind(channel + ".app", callback);
            } else if( typeof callback == "object" && callback.type !== undefined ){
                this._domNode.unbind( callback );
            }

        }
    },
    /** @prototype **/
    {
    });

    //backward compatibility
    if( window.app === undefined ) window.app = {};
    window.app.Hub = yam.Hub;

    return yam.Hub;
});

