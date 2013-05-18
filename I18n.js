/**
 * Language and I18n methods
 *
 * @author Andrew Tereshko <andrew.tereshko@gmail.com>
 * @version 0.3.1
 */
define("app/I18n", ["app/Logger"], function() {

	app.I18n = function( groupAlias, text, ucfirst ){

		ucfirst = ucfirst || false;

		text = app.I18n.get( groupAlias, text, false );

		return ucfirst ? app.I18n.ucfirst( text ) : text;
	};

	app.I18n.storage = {};

	app.I18n.dictMonths = [
		"january", "february", "march", "april", "may", "june",
		"july", "august", "september", "october", "november", "december"
	];

	app.I18n.dictDays = ["monday", "tuesday", "wednesday", "thursday", "friday","saturday","sunday"];

	app.I18n.register = function( groupAlias, strings ){

		this.storage[ groupAlias ] = strings;
	};

	app.I18n.ucfirst = function( str ){
		var f = str.charAt(0).toUpperCase();
		return f + str.substr(1, str.length-1);
	};

	app.I18n.monthByNum = function( num ){

		return num > app.I18n.dictMonths.length - 1 ? false : app.I18n.dictMonths[ num ];
	};

	app.I18n.dayByNum = function( num ){
		return num > app.I18n.dictDays.length - 1 ? false : app.I18n.dictDays[ num ];
	};

	/**
	 *
	 * @todo - check for en lang for auto adding 's' endings
	 *
	 * @param number
	 * @param groupAlias
	 * @param text
	 */
	app.I18n.formByNum = function( number, groupAlias, text ){

		text = app.I18n.get( groupAlias, text, true );

		var keys        = [2, 0, 1, 1, 1, 2],
			mod         = number % 100,
			suffix_key  = Math.min( mod > 4 && mod < 20 ? 2 : keys[ Math.min( mod % 10, 5 ) ], text.length - 1 );

		return text[suffix_key];
	};

	app.I18n.getForm = function( groupAlias, text, key ){

		text = app.I18n.get( groupAlias, text, true );

		return text[ Math.min( key, text.length ) ];
	};

	app.I18n.get = function( groupAlias, text, asArray ){

		asArray = asArray || false;

		var textNew = text + "";

		if( app.I18n.storage[ groupAlias ] !== undefined && app.I18n.storage[ groupAlias ][ text ] !== undefined ){

			textNew = app.I18n.storage[ groupAlias ][ text ];
		}

		if( asArray && !(textNew instanceof Array) ){

			textNew = [textNew]
		}

		if( !asArray && textNew instanceof Array ){

			textNew = textNew.length ? textNew[0] : text;
		}

		return textNew;
	}

});
