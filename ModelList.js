/**
 * Observable model collection
 *
 * Can:
 * - Find model by property value
 * - Sort models by some property
 *
 * @author Andrew Tereshko <andrew.tereshko@gmail.com>
 * @version 0.3.0
 */
define("app/ModelList", ["app/Observable","app/ModelList"], function () {

    "use strict";

    /**
     * @class app.ModelList
     */
    app.Observable.extend("app.ModelList",

        {
            _classDef: undefined,
            _collection: undefined,
            length: 0,
            _proxyed: undefined,

            /**
             *
             * @param {app.AModel.Class} classDef
             * @param {Array} modelsArray
             */
            init: function( classDef, modelsArray ){

                this._classDef = classDef;
                this._collection = [];
                this._proxyed = {};

                this._proxyed.ojectChange = this.proxy(function( event, data ){
                    event.stopPropagation();

                    $( [this, this._collection ]).triggerHandler( "objectChange", $.extend( data, { targetModel: event.target } ) );

                    return false;
                });

                if( undefined !== modelsArray && modelsArray instanceof Array ){

                    var arrLen = modelsArray.length;

                    for( var i = 0; i < arrLen; i++ ){

                        if( modelsArray[ i ] instanceof app.AModel ){

                            this.push( modelsArray[ i ] );
                        }
                        else if ( modelsArray[ i ] instanceof Object && !(modelsArray[ i ] instanceof app.AModel) ){

                            if ( this._classDef.create !== undefined ){

                                this.push( this._classDef.create( modelsArray[ i ] ) );

                            } else {

                                this.push( new this._classDef( modelsArray[ i ] ) );

                            }
                        }
                    }
                }
            },

            /**
             *
             * @param {app.AModel} model
             */
            push: function( model ){

                var self = this;

                this._collection.push( model );

                $( [ model ] ).bind( "propertyChange", this._proxyed.ojectChange );

                this.length++;

                //refresh
                this._trigger( { change: "insert", index: this._collection.length - 1, items: [ model ] } );
            },

            /**
             *
             * @param {app.AModel} model
             */
            unshift: function( model ){


            },

	        /**
	         *
	         * @return {app.AModel}
	         */
            pop: function(){

                var key = this._collection.length - 1,
                    model = this._collection[ key ];

                this._collection.splice( key, 1 );

                this.length = this._collection.length;

                this._trigger( { change: "remove", index: key, items: [ model ] } );

                $( [ model ] ).unbind('objectChange', this._proxyed.ojectChange );

                return model;
            },

            /**
             *
             * @param id
             * @return {app.AModel}
             */
            getById: function( id ){

                var keys = this._getKeyBy( this._classDef.getIdentity(), id );

                return keys.length ? this._collection[ keys[0] ] : null;
            },

	        /**
	         *
	         * @param key
	         * @return {app.AModel}
	         */
            get: function( key ){
                return this._collection[ key ];
            },

	        /**
	         * Get model ids array
	         *
	         * @return {Array}
	         */
	        getIds: function(){

		        var len = this._collection.length;
		        var arr = [];

		        while (len--){
			        arr.push(this._collection[ len ][this._classDef.getIdentity()]);
		        }

		        return arr;

	        },

            /**
             *
             * @param {app.AModel} model
             */
            remove: function( model ){

                var keys = this._getKeyBy( model.Class.getIdentity(), model.getIdentityValue() ),
                    kLen = keys.length;

                if( kLen ){

                    while( kLen-- ){
                        this._collection.splice( keys[kLen], 1 );
                        this._trigger( { change: "remove", index: keys[kLen], items: [ model ] } );

                        this.length--;
                    }
                }

                $( [ model ] ).unbind('objectChange', this._proxyed.ojectChange );

                return kLen;
            },
            filterBy: function( property, value ){

                var keys = this._getKeyBy( property, value ),
                    kLen = keys.length,
                    list = new this.Class( this._classDef );

                for( var key = 0; key < kLen; key++ ){

                    list.push( this._collection[ kLen ] );
                }

                return list;
            },
            each: function( callback ){

                if( typeof callback !== "function" )
                    throw new Error("Invalid argument: callback must be a function");

                var iLen = this._collection.length;

                for( var key = 0; key < iLen; key++ ){

                    callback( this._collection[ key ] );
                }

            },
            _getKeyBy: function( property, value ){

                var arrLen = this._collection.length;

                var res = [];

                for( var key = 0; key < arrLen; key++ ){

                    if( undefined === this._collection[ key ] ) continue;

                    if( this._collection[ key ][ property ] !== undefined && this._collection[ key ][ property ] === value ){

                        res.push( key );
                    }
                }

                return res;
            },
            _trigger: function( data ){
                $( [ this._collection ] ).triggerHandler( "arrayChange", data );
            },
            getArray: function(){
                return this._collection;
            },
            clear: function() {

                var self = this;

                _.each( this._collection, function( model ){

                    $( [ model ] ).unbind('objectChange', self._proxyed.ojectChange );

                });

                this._collection.length = 0;
                this.length = this._collection.length;

                this._trigger( { change: "remove", items: this._collection } );
            }
        }
    );
});
