'use strict';

module.exports = function(grunt) {
    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            js: {
                files: ['gruntfile.js', 'server.js', 'app/**/*.js', 'public/js/**', 'test/**/*.js'],
                tasks: ['jshint'],
                options: {
                    livereload: true,
                },
            },
            html: {
                files: ['public/views/**', 'app/views/**'],
                options: {
                    livereload: true,
                },
            },
            css: {
                files: ['public/css/**'],
                options: {
                    livereload: true
                }
            }
        },
        jshint: {
            all: {
                src: ['gruntfile.js', 'server.js', 'app/**/*.js', 'public/js/**', '!test/**/*.js', '!test/coverage/**/*.js'],
                options: {
                    jshintrc: true
                }
            }
        },
        nodemon: {
            dev: {
                script: 'server.js',
                options: {
                    args: [],
                    ignore: ['public/**'],
                    ext: 'js',
                    nodeArgs: ['--debug'],
                    delayTime: 1,
                    env: {
                        PORT: 3000
                    },
                    cwd: __dirname
                }
            }
        },
        concurrent: {
            tasks: ['nodemon', 'watch', 'concat', 'uglify', 'git_deploy'],
            options: {
                logConcurrentOutput: true
            }
        },
        mochaTest: {
            options: {
                reporter: 'spec',
                require: 'server.js'
            },
            src: ['test/mocha/**/*.js']
        },
        env: {
            test: {
                NODE_ENV: 'test'
            }
        },

        karma: {
            unit: {
                configFile: 'test/karma/karma.conf.js'
            }
        },
        protractor: {
            options: {
                keepAlive: true,
                configFile: 'test/protractor/config.protractor.js'
            },
            run: {},
            your_target: {
                options: {
                    configFile: 'test/protractor/config.protractor.js', // Target-specific config file
                    args: {} // Target-specific arguments
                }
            }
        },
        concat: {
            controllers: {
                src: ['public/website/js/directives.js', 'public/website/js/filters.js', 'public/website/js/controllers/*.js'],
                dest: 'public/website/js/controllers.js'
            },
            services: {
                src: ['public/website/js/services/*.js'],
                dest: 'public/website/js/services.js'
            },
            app: {
                src: ['public/website/js/init.js', 'public/website/js/app.js', 'public/website/js/config.js'],
                dest: 'public/website/app.bootstrap.js'
            }
        },
        uglify: {
            my_target: {
                files: {
                    'public/website/js/garp.min.js': ['public/website/app.bootstrap.js', 'public/website/js/services.js', 'public/website/js/controllers.js']
                }
            }
        },
        git_deploy: {
            your_target: {
                options: {
                    url: 'https://github.com/GARPDev/website.git'
                },
                src: 'public/website'
            },
        },

    });

    //Load NPM tasks
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-protractor-runner');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-git-deploy');

    //Making grunt default to force in order not to break the project.
    grunt.option('force', true);

    //Default task(s).
    grunt.registerTask('default', ['jshint', 'concurrent']);

    //Test task.
    grunt.registerTask('test', ['env:test', 'mochaTest', 'karma:unit', 'protractor:run']);
};