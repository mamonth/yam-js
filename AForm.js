define("app/AForm", function () {

    /**
     * @exports AForm
     * @class app.Aform
     * @abstract
     *
     * Abstract form model. Includes form validation and various callbacks.
     */
    $.Class.extend('app.AForm',
        /* @static */
        {
            /**
             * Collection of redefined rules for re-use in formRules[]
             *
             * @example rule - { name:"email", rule: "email" }
             */
            constRules:{
                email:/^[\w\d\._-]+@[\w\d\.-]+\.[\w]{2,5}$/,
                href:/^https?:\/\/[\w\d\.-]+\.[\w]{2,5}$/
            }
        },
        /* @prototype */
        {
            /**
             * jQuery selector, to bind model.
             */
            selector:undefined,

            /**
             * jQuery.tmpl template path (or precompiled template name ) to bind model
             */
            template:undefined,

            /**
             * Internal container pointer.
             * Outside class must be used only through getContainer() method.
             * @private
             */
            container:undefined,

            /**
             * Custom properties like that also supported =)
             */
            title:undefined,

            /**
             * Form validation rules set.
             * @example { name: "email", rule: "email", message: "", required: true }
             */
            formRules:[],

            /**
             * Indicates form validation state
             *
             * @var {boolean}
             */
            validated: undefined,

            /**
             * internal field links storage
             * @private
             */
            _fields:undefined,

            /**
             * Form container lazy init method
             *
             * @return {object} jQuery( form dom )
             */
            getContainer:function () {

                var self = this;

                if ( undefined === this.container ) {

                    if (this.template !== undefined) {

                        this.container = $.tmpl( this.template, this );
                    }
                    else if (this.selector !== undefined) {

                        this.container = $(this.selector);
                    }

                    this.container.find("textarea, input[type!=submit], select")
                        // bind imidiatly fields recheck
                        .bind( "focusout", function(){

                            if ( $(this).data( "checkTimeout" ) ) {
                                window.clearTimeout( $(this).data( "checkTimeout" ) );
                            }
                            self.validate.call( self );
                        })
                        // clear error state after user start typing or paste something
                        // and mark as changed
                        .bind( "keypress", function(){

                            $(this).data( "field-changed", true );

                            if ( $(this).data( "checkTimeout" ) ) {
                                window.clearTimeout( $(this).data( "checkTimeout" ) );
                            }

                            self.clearField( $(this) );

                        })
                        // bind timeout fields recheck
                        .not("textarea").bind( "keyup", function () {

                            if ( $(this).data( "checkTimeout" ) ) {
                                window.clearTimeout( $(this).data( "checkTimeout" ) );
                            }

                            var timeout = window.setTimeout( self.callback( "validate" ), 1050);

                            $(this).data('checkTimeout', timeout);

                        });

                    this.container.filter("form").submit( function( e ){
                        e.preventDefault();
                        
                        if( self.onBeforeSubmit() ){
                            if( self.validate(false) ) self.onSubmit( this );
                        }
                    });
                }

                return this.container;
            },
            onBeforeSubmit:function(){
                return(true);
            },

            /**
             * Form submit callback. Must be implemented in inherit classes.
             */
            onSubmit: function() {
            },

            /**
             * Form validate callback. Must be implemented in inherit classes.
             *
             * @param { object } messages
             */
            onValidate: function( messages ) {
            },

            /**
             * Return field by name. Useful, because uses cache.
             *
             * @param {string} fieldName
             * @return {object} jQuery( field dom )
             */
            getField:function (fieldName) {

                if( undefined === this._fields ) this._fields = {};

                if( undefined === this._fields[ fieldName ] ) {

                    this._fields[ fieldName ] = this.getContainer().find("[name=" + fieldName + "]")
                }

                return this._fields[ fieldName ];
            },
            validate: function ( skipUnchanged ) {

                var result = {}, i, rule;
                skipUnchanged = skipUnchanged === false ? false : true;

                this.validated = true;

                for ( i in this.formRules ) {

                    rule = this.formRules[i];

                    if ( undefined === rule || undefined === rule.name ) continue;

                    if( undefined !== result[ rule.name ] && result[ rule.name ] !== false ) continue;

                    if( skipUnchanged && !this.getField( rule.name ).data("field-changed") ) {

                        if( false !== this.applyRule( rule ) ) this.validated = false;
                    }
                    else {

                        result[ rule.name ] = this.applyRule( rule );

                        if( false !== result[ rule.name ] ) this.validated = false;
                    }
                }

                this.onValidate.call( this, result );

                return this.validated;
            },

            /**
             * Apply specific rule
             *
             * @private
             * @param {object} rule
             * @param {object} checkParts
             * @return {boolean}
             */
            applyRule: function ( rule, checkParts ) {

                checkParts = checkParts

                var result;

                if (undefined === rule || undefined === rule.name) {
                    throw "Param 'rule' is required and must be an object";
                }

                var content = this.getField( rule.name ).length ? this.getField( rule.name ).val() : "";

                if ( undefined !== rule.required && rule.required && !content.length ) {

                    result = "Обязательное поле";
                }
                else if ( rule.rule !== undefined && content.length ) {

                    if( rule.rule instanceof RegExp ) {

                        result = rule.rule.test( content );
                    }
                    else if ( this.Class.constRules[ rule.rule ] !== undefined ) {

                        result = this.Class.constRules[ rule.rule ].test( content );
                    }
                    else if ( typeof rule.rule == "function" ) {

                        result = rule.rule.call( this, content );
                    }
                    else {
                        throw "Unknown rule syntax or name";
                    }

                    if( result === false ) {

                        result = ( undefined === rule.message ) ? "Некорректные данные" : rule.message;
                    }
                    else { result = false; }
                }
                else {
                    result = false;
                }

                return result;

            },
            
            /**
             * Drop form state ( form values, states, errors )
             */
            reset: function() {

                this.getContainer()
                    .find( "input[type!=submit], textarea" )
                    .attr({value: ""})
                    .data( "field-changed" , false )
                    .removeClass("inputs-error");

                this.getContainer().find(".label-error").remove();

                this.getContainer().find(".buttons").addClass("inactive");
            },
            clearField: function( fieldEl ) {},
            request:function(success){
                var Form = this.container.filter("form").get(0);

                $.ajax({
                    url:Form.action,
                    type:Form.method,
                    dataType:"json",
                    data: $ (Form ).serializeArray(),
                    success:((typeof success=="function")?success:function(){})
                });
            }
        });

});
