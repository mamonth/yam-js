/**
 * App Module Interface
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.2.1
 */
define("app/IModule", ["app/Hub", "app/Logger"], function(Hub, Logger) {
    "use strict";

    $.Class.extend("app.IModule", {
        init: function() {
            throw new Error(this.constructor.fullName + ": не реализован метод init");
        },
        run: function() {
            throw new Error(this.constructor.fullName + ": не реализован метод run");
        },
        destruct: function() {
            throw new Error(this.constructor.fullName + ": не реализован метод destruct");
        }
    });

    return app.IModule;
});

