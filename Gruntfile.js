"use strict";

module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      all: ['*.js', 'test/unit/*.js', 'test/functional/*.js']
      , options: {
        laxcomma: true
        , es5: true
        , trailing: true
        , node: true
        , strict: true
      }
    }
    , mochaTest: {
      unit: ['test/unit/*.js']
      , functional: ['test/functional/*.js']
    }
    , mochaTestConfig: {
      options: {
        timeout: 6000,
        reporter: 'spec'
      }
    }
  });

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.registerTask('lint', ['jshint']);
  grunt.registerTask('test', ['jshint', 'unit']);
  grunt.registerTask('unit', 'mochaTest:unit');
  grunt.registerTask('default', ['test']);
};

