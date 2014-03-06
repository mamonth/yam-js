/**
 * Tool for sync local (client) and  remote (server) time
 * Correction is made between UTC timestamps.
 *
 * @author Andrew Tereshko <andrew.tereshko@gmail.com>
 */
define( ["./I18n","./Logger","./Hub"], function () {
    "use strict";

	// Use app.I18n as lang
	var lang = app.I18n;

	/**
	 * @class app.Time
	 */
    $.Class.extend("app.Time",
    /* @static */
    {
	    /**
	     * diff in ms with remote server time (without timezone)
	     */
	    remoteDiff: 0,

	    /**
	     *
	     * @param {string} timeString
	     */
	    syncWith: function( timeString ){

		    var localDate   = new Date();
		    var remoteDate  = new Date( timeString );

		    this.offset = localDate.getTime() - remoteDate.getTime();
	    },

	    /**
	     * Return corrected local date
	     *
	     * @return {Date}
	     */
	    getDate: function(){

		    var date = new Date();

		    date.setTime( date.getTime() + this.remoteDiff );

		    return date;
	    },

	    /**
	     * returns utc unix time (seconds) to local Date
	     *
	     * @param unixTimestamp
	     * @return {Date}
	     */
	    convertUtcToLocal: function( unixTimestamp ){

		    var date   = new Date(),
			    offset = -date.getTimezoneOffset() * 60;

		    return new Date( ( unixTimestamp + offset ) * 1000 );
	    },

	    /**
	     *
	     * @param {Date} date
	     * @param {String} I18nSection
	     * @return {String}
	     */
	    getActivityString: function( date, I18nSection ){

		    if( undefined === date ) date = this.getDate();

		    var currentDate     = new Date(),
			    currentMin      = Math.ceil( ( currentDate.getTime() / 1000 ) / 60 ),
			    targetMin       = Math.ceil( ( date.getTime() / 1000 ) / 60),
			    diffMin         = Math.ceil( currentMin - targetMin),
			    humanStr        = null;

		    if( diffMin <= 0 ){

			    humanStr = lang( I18nSection, "just now" );
		    } else if ( diffMin < 21 ){

			    humanStr = ( diffMin == 1 ? "" : diffMin + " " ) + "минуту назад";
		    } else if ( diffMin < 46  ) {

			    humanStr = "полчаса назад";
		    }

		    // hours
		    if( humanStr === null ){

			    var diffHours = Math.ceil( diffMin / 60 );

		        if ( diffHours < 1 ) {

				    humanStr = lang( I18nSection, "about" ) + " " + lang + " " + lang( I18nSection, "ago" );
			    } else if( diffHours < 24 ){

				    humanStr = ( diffHours == 1 ? "" : diffHours + " " )
					    + lang.formByNum( diffHours, I18nSection, "hour" ) + " " + lang( I18nSection, "ago" );
		        }
		    }

		    // days
		    if( humanStr === null ){

			    var diffDays = Math.round( diffHours / 24 );

		        if( diffDays < 2 ) {

			        humanStr = lang( I18nSection, "yesterday" ) + ", " + lang( I18nSection, "at" ) + " "
				        + date.getHours() + ":" + ( date.getMinutes() < 10 ? "0" : "" ) + date.getMinutes();
			    } else if ( diffDays < 7 ){

				    humanStr = lang( I18nSection, lang.dayByNum( date.getDay() ) )
					    + " " + lang( I18nSection, "at" ) + " "
					    + date.getHours() + ":" +( date.getMinutes() < 10 ? "0" : "" ) + date.getMinutes();

			    } else if ( diffDays == 7 ){

			        // black magick here - 1 is genitive key for month
				    humanStr = lang.getForm( I18nSection, "week", 3 ) + " " + lang( I18nSection, "ago" );
		        } else {

			        // black magick here - 1 is genitive key for month
			        humanStr = date.getDate() + " " + lang.getForm( I18nSection, lang.monthByNum( date.getMonth() ), 1 );
		        }

		    }

		    return humanStr;
	    },

        _instance: null,

        getInstance: function () {
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

