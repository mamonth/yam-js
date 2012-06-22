define("app/AMainPager",[ "app/Router" ], function( Router ) {

    $.Class.extend('app.AMainPager',
    {},

    {
        selector : undefined,
        container: undefined,
        template : undefined,
        pages    : {
            current: undefined,
            total  : undefined
        },

        init: function(currentPage, totalPages) {
            //if(undefined === this.pages.current) {
                this.pages.current = currentPage;
            //}

            //if(undefined === this.pages.total) {
                this.pages.total = totalPages;
            //}

            this.getContainer();//.delegate("a", "click", this.callback("onClick") );
            this.render();
        },

        getContainer: function() {
            if(undefined === this.container) {
                if(this.selector !== undefined) {
                    this.container = $(this.selector);
                }
            }

            return this.container;
        },

        render: function() {
            var list  = new Array();

            if((undefined === this.pages.current) || (this.pages.current < 1)) {
                this.pages.current = 1;
            }

            var rangeB = 0;
            var rangeE = 0;

            if(this.pages.total <=10) {
                rangeB = 1;
                rangeE = this.pages.total;
            } else {
                var rPages = this.pages.total - this.pages.current;

                if(rPages > 0) {
                    if(rPages >= 5) {
                        if(this.pages.current > 5) {
                            rangeB = this.pages.current - 4;
                            rangeE = this.pages.current + 5;
                        } else {
                            rangeB = 1;
                            rangeE = 10;
                        }
                    } else {
                        rangeB = this.pages.total - 10;
                        rangeE = rangeE = this.pages.total;
                    }
                } else {
                    rangeB = this.pages.total - 10;
                    rangeE = this.pages.total;
                }
            }

            var params = Router.getParams();

            for(var p = rangeB; p <= rangeE; p++) {

                params.page = p;

                var paramString = Router.buildParamsString( params );

                if(p === this.pages.current) {
                    list.push({url: "/" + Router.getCurrentPath() + '?' + paramString, num: p, active: 1 });
                } else {
                    list.push({url: "/" + Router.getCurrentPath() + '?' + paramString, num: p, active: 0 });
                }
            }

            $(this.container).empty();
            $.tmpl(this.template, { pages : list }).appendTo(this.container);
        },

        setPage: function(currentPage){
            this.pages.current = (currentPage) ? parseInt(currentPage) : 0;
            this.render();
        },

        onClick: function( e ){
            e.preventDefault();
            window.History.pushState( null, document.title, $( e.target ).attr("href") );
        }
    });

});