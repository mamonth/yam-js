/**
 *
 * @author Andrew Tereshko <andrew.tereshko@gmail.com>
 *
 * @version 0.4.0
 */
(function(){

    var modules = [
            'Logger',
            'IModule',
            'ADeferredModule',
            'Hub',
            'Observable',
            'State',
            'ModelWatcher',
            'ModelList',
            'AModel',
            'AWatchedModel',
            'Router',
            'I18n',
            'Core'
        ],
        mCnt = modules.length,
        dependencies = [],
        yam = {};

    while( mCnt-- ){ dependencies.unshift( 'yam/' + modules[ mCnt ] ); }

    define( 'yam', dependencies, function() {

        for( var i = 0; i < arguments.length; i++ ){

            yam[ modules[ i ] ] = arguments[i];
        }

        return yam;
    });

})();