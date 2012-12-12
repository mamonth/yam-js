/**
 * Single entry point file
 *
 *
 */
require.config({
    waitSeconds: 10,
    paths:{
        "app": "../"
    }
});


require(["app/App", "app/Hub", "app/Logger"], function(){

    app.Logger.level = app.Logger.LOG;

    new app.App({
        baseNamespace: "demo",
        routes: {
            "demo.com.menu.Module" : [/.*\/([^\/]+)\.html$/]
        }
    });

    app.App.getInstance().run();

});
