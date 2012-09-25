define(["app/AModel"], function() {
    "use strict";

    /**
     * @class demo.com.menu.Item
     */
    app.AModel("demo.com.menu.Item",
        {
            /**
             * Get all menu items
             */
            getList: function(){

                var self = this,
                    defer = $.Deferred();

                $.ajax({
                    url: "data/menuItems.json",
                    dataType: "json"
                }).then( function( response ){

                    defer.resolve( new app.ModelList( self, response ) );
                });

                return defer.promise();
            },
            get: function( identity ){



            }
        },
        {
            href: undefined,
            title: undefined,
            active: undefined,
            _activeText: "",
            setActive: function( value ){

                var curVal = this.active === true;

                this.active = value === true;

                this._activeText = value === true ? "active" : "";

                this._triggerProperty( "active", value, curVal );
            }
        }
    );
});
