'use strict';

var Logger  = require( __dirname + '/../src/Logger.js');


describe('Log levels', function() {


    beforeEach( function(){

        spyOn( Logger, '_echo');
    });

    it( '', function(){

        Logger.level = Logger.LOG;
        Logger.log( 'some', 2, [ '1' ] );

        expect( Logger._echo ).toHaveBeenCalledWith( [ 'some', 2, [ '1' ] ], 'log' );
    });

    it( '', function(){

        Logger.level = Logger.NONE;
        Logger.warn( 1 );

        expect( Logger._echo ).not.toHaveBeenCalled();

    });

});
