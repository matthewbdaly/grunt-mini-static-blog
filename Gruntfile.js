/*
 * grunt-mini-static-blog
 * https://github.com/matthewdaly/grunt-mini-static-blog
 *
 * Copyright (c) 2015 Matthew Daly
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    mini_static_blog: {
      default: {
        options: {
          data: {
            author: "My Name",
            url: "http://www.example.com",
            disqus: "",
            title: 'My new blog',
            description: 'A blog'
          },
          template: {
            post: 'templates/post.hbs',
            page: 'templates/page.hbs',
            index: 'templates/index.hbs',
            header: 'templates/partials/header.hbs',
            footer: 'templates/partials/footer.hbs',
            notfound: 'templates/404.hbs'
          },
          src: {
            posts: 'content/posts/',
            pages: 'content/pages/'
          },
          www: {
            dest: 'build'
          }
        }
      }
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'mini_static_blog']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
