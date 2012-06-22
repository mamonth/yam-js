/**
 * 
 *
 */
define("app/Time", ["app/Logger","app/Hub"], function (Logger, Hub) {
    "use strict";

    $.Class.extend("app.Time",
    /* @static */
    {
        _instance: null,

        getInstance: function (url) {
            if (!app.Time._instance) app.Time._instance = new app.Time();
            return app.Time._instance;
        }
    },
    /* @prototype */
    {
    
    
        offset:0,
        init:function(){
            Hub.sub("Time.sync", this.callback("sync"));
        },
        sync:function(timeString){
            var d = new Date();
            var n =  new Date( timeString );
            this.offset = n.getTime()-d.getTime();
            //.getTimezoneOffset()
            //Logger.warn(this,this.offset);
            
        },
        getDate:function(){
            var d = new Date();
            var newTime = d.getTime() + this.offset;
            d.setTime(newTime);
            return(d);
        },
        transformTimeString:function(time){
                var now = Number( this.getDate().getTime() );
                var dateObj = new Date(time);
                var str=dateObj.myformat('dd.mm.yyyy в hh:nn:ss');
                var sec = Math.round((now - time)/1000);
                var n,end="";
                if( sec  < 60*60*24 ){
                    n = String(Math.round(sec/3600));
                    end="ов"
                    if(/^[^1]*1$/.test(n)){end=""}
                    if(/^[^1]*(2|3|4)$/.test(n)){end="a"}
                    str = n+" час"+end+" назад"; 
                }if( sec  < 60*60 ){
                    n = String(Math.round(sec/60));
                    end=""
                    if(/^[^1]*1$/.test(n)){end="a"}
                    if(/^[^1]*(2|3|4)$/.test(n)){end="ы"}
                    str = n+" минут"+end+" назад";
                }if( sec  < 60 ){
                    /*n = String(sec);
                    end=""
                    if(/^[^1]*1$/.test(n)){end="a"}
                    if(/^[^1]*(2|3|4)$/.test(n)){end="ы"}
                   str = sec+" секунд"+end+" назад"; */
                   str = "менее минуты назад";
                }
                return(str);
            
        }
    });

    return app.Time;
});

