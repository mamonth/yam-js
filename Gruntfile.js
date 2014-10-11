/*jshint node: true */

'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jasmine_node: {
            options: {
                forceExit: true,
                match: '.',
                matchall: false,
                extensions: 'js',
                specNameMatcher: 'test',
                jUnit: {
                    report: true,
                    savePath : "./build/reports/jasmine/",
                    useDotNotation: true,
                    consolidate: true
                }
            },
            src: ['test/']
        },
        watch: {
            files: [
                'src/Core.js',
                'src/Logger.js',
                'test/Logger.test.js'
            ],
            tasks: 'test:src'
        },
        uglify: {
            options:{
                sourceMap: true,
                preserveComments: 'some'
            },
            main_target: {
                files: {
                    'dist/yam.min.js': [
                        'src/Logger.js',
                        'src/Hub.js',
                        'src/State.js',
                        'src/Router.js',
                        'src/Observable.js',
                        'src/AModel.js',
                        'src/AWatchedModel.js',
                        'src/ModelList.js',
                        'src/ModelWatcher.js',
                        'src/IModule.js',
                        'src/ADeferredModule.js',
                        'src/I18n.js',
                        'src/Core.js',
                        'src/yam.js'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-jasmine-node-new');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('test', ['jasmine_node']);

    grunt.registerTask('default', ['test', 'uglify'] );
};
