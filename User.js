/**
 * App User объект пользователя, должен узнавать обо всех изменениях от комета
 */
define("app/User", ["app/Logger", "app/Hub"], function (Logger, Hub) {
    "use strict";

    var global = (function () { //get global object
        return this || eval.call(null, 'this');
    } ()),
    $ = global.$,
    canCache,
    can;

    app.User = {
        hasAvatar: false,
        avatarReal: "",
        title: null,
        userId: null,
        avatar25: "",
        avatar50: "",
        name:'',
        money: 0,
        statuses: {
            profile: 0,
            email: 0,
            user: -1,
            premium: 0
        },
        init: function () {
            app.User.update(global.zarium);
            Hub.sub("User.update", app.User.update );
            Hub.sub("User.reload", app.User.reload );
        },
        reload:function(){
            $.ajax({
                url:"/user/getInfo",
                dataType: "json",
                cache:false,
                success:app.User._reload
            });
        },
        _reload:function(data, textStatus, jqXHR){
            Logger.warn("User",data);
            app.User.update(data.data.success);
        },
        update: function (data) {
            $.each(data, function (key, value) {
                 app.User[key] = value;
            });
            Hub.pub("User.updated");

            /* При обнвлении данных о пользователе, нужно обновлять обращение в шапке */
            if(app.User.title) {
                $('#loginBlock .log-name').text(app.User.title);
            }
        },
        /**
         * @description Check user permissions on some actions
         */
        can: function (action) {
            return $.isFunction(canCache[action]) ? canCache[action](this) : canCache[action];
        }
    }

    app.User.init();
    can = app.User.can;
    /**
     * Initialize cahce object
     */
    canCache = can.cache = {};

    /**
     * @param {String|Array} action
     * @param {String|Function} test
     * @param {Boolean} force Rewrite test on action if test exists
     */
    can.add = function (action, test, force) {
        if (typeof canCache[action] === 'undefined' || force) {
            if (!$.isArray(action)) {
                canCache[action] = test;
                return;
            }

            $.each(action, function (key, value) {
                canCache[value] = test;
            });
        }
    };

    /**
     * Some predefined permissions
     */
    can.add(['searchInUse'], function (user) {
        return user.sex;
    });

    can.add(['uploadPhoto'], function (user) {
        return user.sex;
    });

    can.add(['writeMessage', 'addToFriends'], function (user) {
        if(user.statuses.profile != undefined && user.statuses.profile == 1) {
            return user.statuses.profile;
        }

        return false;
    });

    return app.User;
});
