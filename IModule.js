/**
 * Routed module interface
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.2.1
 */
define("app/IModule", ["app/Hub", "app/Logger"], function(Hub, Logger) {
    "use strict";
    
    $.Class.extend("app.IModule", {
        init: function() {
        },
        run: function() {
            throw new Error( this.constructor.fullName + ": method run must be implemented.");
        },
        destruct: function() {
            throw new Error(this.constructor.fullName + ": method destruct must be implemented");
        }
    });

    return app.IModule;
});

