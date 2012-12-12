define(["text!tmpl/menu.tmpl", "text!tmpl/menuItem.tmpl", "app/IModule", "com/menu/Item"], function( menuTmpl, menuItemTmpl ) {
    "use strict";

    // Aliases
    var MenuModel = demo.com.menu.Item;

    /**
     * Top menu module
     *
     * @class demo.com.menu.Module
     */
    app.IModule.extend("demo.com.menu.Module", {
        tmpl: { cover: "menuCover", item: "menuItem" },
        container: undefined,
        itemList: undefined,
        _ready: undefined,
        init: function() {

            // Pre-compile templates
            $.templates( this.tmpl.cover, menuTmpl );
            $.templates( this.tmpl.item, menuItemTmpl );

            // Prepare module ready object
            this._ready = $.Deferred();

            // Retrieving data
            MenuModel.getList().then( this.proxy("_resolve") );

            this.container = $("#top-nav");
        },
        run: function( params ) {

            this._ready.then( this.proxy("_render") );

            var self = this;

            // add menu item
            $("#addMenu").click(function(e){

                e.preventDefault();

                var i = 5;
                while( i -- ){
                    self.itemList.push( new MenuModel({
                        id: self.itemList.length + 1,
                        title: "Menu-" + ( self.itemList.length + 1 ),
                        href: "#"
                    }));
                }
            });

            // remove menu item
            $("#removeMenu").click(function(e){

                e.preventDefault();

                app.ModelWatcher.unregister( self.itemList.pop() );
            });
        },
        onClick: function( event ){

            event.preventDefault();

            var menuView = $.view( event.currentTarget ),
                menuItem = this.itemList.get( menuView.index );

            if( menuItem.active ) return;

            this.itemList
                .each( function( model ){
                    if( model.active ) model.setActive( false );
                });

            this.container.find("li.active").each( function(){ $.view( this ).refresh(); } );

            menuItem.setActive( true );

            menuView.refresh();
        },
        _render: function(){

            this.itemList.getById(1).setActive( true );

            $.link[ this.tmpl.item ]( this.container, this.itemList.getArray() );

            console.warn( this.itemList.getArray()  );

            this.container.delegate( "li", "click", this.proxy("onClick") );
        },
        _resolve: function( itemList ){

            this.itemList = itemList;

            this._ready.resolve();
        },
        destruct: function() {
            delete this.template;
        }
    });
});
