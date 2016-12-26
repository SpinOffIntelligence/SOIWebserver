'use strict';

module.exports = function(grunt) {
    // Project Configuration
    grunt.initConfig({
      concat: {
        basic: {
          src: ['src/main.js'],
          dest: 'dist/basic.js',
        },
        extras: {
          src: ['src/main.js', 'src/extras.js'],
          dest: 'dist/with_extras.js',
        },
      },
    });

    //Load NPM tasks

    //Default task(s).
    grunt.registerTask('default', ['concat']);

};