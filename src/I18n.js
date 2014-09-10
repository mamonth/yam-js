/**
 * Language and I18n methods
 *
 * @author Andrew Tereshko <andrew.tereshko@gmail.com>
 * @version 0.3.1
 */
define( ["./Logger"], function() {

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

		text = app.I18n._get( groupAlias, text, true );

		var keys        = [2, 0, 1, 1, 1, 2],
			mod         = number % 100,
			suffix_key  = Math.min( mod > 4 && mod < 20 ? 2 : keys[ Math.min( mod % 10, 5 ) ], text.length - 1 );

		return text[suffix_key];
	};

	app.I18n.getForm = function( groupAlias, text, key ){

		text = app.I18n._get( groupAlias, text, true );

		return text[ Math.min( key, text.length ) ];
	};

	app.I18n._get = function( groupAlias, text, asArray ){

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
	};

    /**
     *
     */
    app.I18n.get = function( groupAlias, variable ){

        var string  = variable + '';

        if( app.I18n.storage[ groupAlias ] !== undefined && app.I18n.storage[ groupAlias ][ variable ] !== undefined ){

            string = app.I18n.storage[ groupAlias ][ variable ];
        }

        // process format
        if( string ){

            var args = Array.prototype.slice.call(arguments).splice( 2 );

            args.unshift( string );

            string = app.I18n.format.apply( app.I18n, args );
        }

        return string;

    };

    /**
     * internal sprintf analog
     *
     *
     */
    app.I18n.format = function( string ){

        var args    = Array.prototype.slice.call(arguments).splice( 1 ),
            string  = typeof string.substring != 'undefined' ? string : '';

        // first step - replace simple forms
        string = string.replace(/{%(\d+)}/g, function(match, number) {
            number--;

            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });

        // second step- find available tags and process them
        string = string.replace( /\[(\w+)(:([^\]]+))?\]/g, function( match, tagName, s, tagArgs ){

            var tagArgs = tagArgs ? tagArgs.split('|') : [],
                tagFunc = '_' + tagName + 'Tag',
                replaced  = false;

            if( typeof app.I18n[tagFunc] == 'function' ){
                replaced = app.I18n[tagFunc]( args[0], tagArgs );
            } else {
                throw new Error('Unsupported tag"' + tagName + '"');
            }

            return replaced ? replaced : '';
        });

        return string;
    };

    app.I18n._countTag = function( number, args ){

        var keys        = [2, 0, 1, 1, 1, 2],
            mod         = number % 100,
            suffix_key  = Math.min( mod > 4 && mod < 20 ? 2 : keys[ Math.min( mod % 10, 5 ) ], args.length - 1 );

        return args[ suffix_key ];
    };

});
