/**
 * App Comet module
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.2.1
 */
define("app/Comet", ["app/Hub", "app/Logger","app/App", "app/User"], function(Hub, Logger, App, User) {
    "use strict";

    $.Class.extend("app.Comet",
    /* @static */
    {
        _instance: null,

        getInstance: function (url) {
            if (!app.Comet._instance) app.Comet._instance = new app.Comet(url);
            return app.Comet._instance;
        }
    },
    /* @prototype */
    {
        url: null,
        stop:false,
        timer:null,
        lastId:0,
        lastBroadcastId:0,
        errorsCnt:0,
        init: function (url) {
            Logger.warn(this,"START");
            this.url = url;
            this.key = keyGen();
            this._poll();
            Hub.sub("Commet.reload",this.callback('reInit'));
        },
        reInit:function(){
            Logger.warn(this,"Commet REINIT");
            var instance = this;
            var url = instance.url;
            instance.stop = true;
            clearTimeout(instance.timer);
            app.Comet._instance = new app.Comet(url);
            
        },
        _poll: function () {
            Logger.info(this, this.key,  "polling to " + this.url);
            this.connect(this.url,this.proxy("_onSuccess"),this.proxy("_onError"));
        },

        _onError: function (jqXHR, status, error) {
            if(this.stop){ Logger.warn(this, this.key,"Commet STOP with error"); return; }
            Logger.error(this, this.url, status, error);
            this.errorsCnt++;
            if(this.errorsCnt>20){this.errorsCnt=20;}
            setTimeout( this.proxy('_poll'), 3000*this.errorsCnt );
        },

        _onSuccess: function (data) {
            if(this.stop){ Logger.warn(this, this.key,"Commet STOP");return; }
            this.lastId=data.id;
            this.lastBroadcastId = data.broadcastId ||0;
            if(data.time){ Hub.pub("Time.sync",data.time); }
            this.errorsCnt=0;
            if(data.isAuthorized == false || ( User.userId && data.userId != User.userId )){ 
                if(location.href.indexOf("/u/") == -1){
                location.reload();
                }else{
                location = "/";
                }
                
                 
                return; }
            for(var i in data.stack)
            {
               if(data.stack[i].channel){ 
                    Logger.info(this, "got message id:",data.id," data:", data.stack[i].data, "to channel \"" +data.stack[i].channel + "\"");
                    Hub.pub(data.stack[i].channel, data.stack[i].data); 
                }
            }

            //this.timer = setTimeout(this.proxy('_poll'),100);
            this._poll();
        },
        connect:function(url,success,error)
        {
                $.ajax({
                url: url,
                success: success,
                error: error,
                data: { "lastId": this.lastId ,"lastBroadcastId":this.lastBroadcastId },
                timeout: 35000,
                async: true,
                cache: false,
                dataType: "json"
            });
        }
    });

    return app.Comet;
});

