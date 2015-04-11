/*
 * grunt-mini-static-blog
 * https://github.com/matthewbdaly/grunt-mini-static-blog
 *
 * Copyright (c) 2015 Matthew Daly
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('mini_static_blog', 'Grunt plugin for creating a static blog', function() {
    // Import external libraries
    var Handlebars = require('handlebars'),
      Moment = require('moment'),
      RSS = require('rss'),
      hljs = require('highlight.js'),
      MarkedMetadata = require('meta-marked'),
      _ = require('lodash'),
      parseUrl = require('url');

    // Declare variables
    var output, path;

    // Import options
    var options = this.options({
      year: new Date().getFullYear(),
      size: 5
    });
    options.domain = parseUrl.parse(options.data.url).hostname;

    // Register partials
    Handlebars.registerPartial({
      header: grunt.file.read(options.template.header),
      footer: grunt.file.read(options.template.footer)
    });

    // Get languages
    var langs = hljs.listLanguages();

    // Get Marked Metadata
    MarkedMetadata.setOptions({
      gfm: true,
      tables: true,
      smartLists: true,
      smartypants: true,
      langPrefix: 'hljs lang-',
      highlight: function (code, lang) {
        if (typeof lang !== "undefined" && langs.indexOf(lang) > 0) {
          return hljs.highlight(lang, code).value;
        } else {
          return hljs.highlightAuto(code).value;
        }
      }
    });

    // Get matching files
    var posts = grunt.file.expand(options.src.posts + '*.md', options.src.posts + '*.markdown');
    var pages = grunt.file.expand(options.src.pages + '*.md', options.src.pages + '*.markdown');

    // Get Handlebars templates
    var postTemplate = Handlebars.compile(grunt.file.read(options.template.post));
    var pageTemplate = Handlebars.compile(grunt.file.read(options.template.page));
    var indexTemplate = Handlebars.compile(grunt.file.read(options.template.index));
    var notFoundTemplate = Handlebars.compile(grunt.file.read(options.template.notfound));

    // Generate posts
    var post_items = [];
    posts.forEach(function (file) {
      // Convert it to Markdown
      var content = grunt.file.read(file);
      var md = new MarkedMetadata(content);
      var mdcontent = md.html;
      var meta = md.meta;

      // Get path
      var permalink = '/blog/' + (file.replace(options.src.posts, '').replace(/(\d{4})-(\d{2})-(\d{2})-/, '$1/$2/$3/').replace('.markdown', '').replace('.md', ''));
      var path = options.www.dest + permalink;

      // Render the Handlebars template with the content
      var data = {
        year: options.year,
        data: options.data,
        domain: options.domain,
        path: permalink + '/',
        meta: {
          title: meta.title.replace(/"/g, ''),
          date: meta.date,
          formattedDate: new Moment(new Date(meta.date)).format('Do MMMM YYYY h:mm a'),
          categories: meta.categories
        },
        post: {
          content: mdcontent,
          rawcontent: content
        }
      };
      post_items.push(data);
    });

    // Sort posts
    post_items = _.sortBy(post_items, function (item) {
      return item.meta.date;
    });

    // Get recent posts
    var recent_posts = post_items.slice(Math.max(post_items.length - 5, 1)).reverse();

    // Output them
    post_items.forEach(function (data, index, list) {
      // Get next and previous
      if (index < (list.length - 1)) {
        data.next = {
          title: list[index + 1].meta.title,
          path: list[index + 1].path
        };
      }
      if (index > 0) {
        data.prev = {
          title: list[index - 1].meta.title,
          path: list[index - 1].path
        };
      }

      // Get recent posts
      data.recent_posts = recent_posts;

      // Render template
      var output = postTemplate(data);

      // Write post to destination
      grunt.file.mkdir(options.www.dest + data.path);
      grunt.file.write(options.www.dest + data.path + '/index.html', output);
    });
 
    // Generate pages
    pages.forEach(function (file) {
      // Convert it to Markdown
      var content = grunt.file.read(file);
      var md = new MarkedMetadata(content);
      var mdcontent = md.html;
      var meta = md.meta;
      var permalink = '/' + (file.replace(options.src.pages, '').replace('.markdown', '').replace('.md', ''));
      var path = options.www.dest + permalink;

      // Render the Handlebars template with the content
      var data = {
        year: options.year,
        data: options.data,
        domain: options.domain,
        path: path,
        meta: {
          title: meta.title.replace(/"/g, ''),
          date: meta.date
        },
        post: {
          content: mdcontent,
          rawcontent: content
        },
        recent_posts: recent_posts
      };
      var output = pageTemplate(data);

      // Write page to destination
      grunt.file.mkdir(path);
      grunt.file.write(path + '/index.html', output);
    });

    // Generate RSS feed
    var feed = new RSS({
        title: options.data.title,
        description: options.data.description,
        url: options.data.url
    });

    // Get the posts
    for (var post in post_items.reverse().slice(0, 20)) {
      // Add to feed
      feed.item({
        title: post_items[post].meta.title,
        description: post_items[post].post.content,
        url: options.data.url + post_items[post].path,
        date: post_items[post].meta.date
      });
    }

    // Write the content to the file
    path = options.www.dest + '/atom.xml';
    grunt.file.write(path, feed.xml({indent: true}));

    // Create 404 page
    var newObj = {
      data: options.data,
      year: options.year,
      domain: options.domain
    };
    output = notFoundTemplate(newObj);
    path = options.www.dest;
    grunt.file.mkdir(path);
    grunt.file.write(path + '/404.html', output);

    // Generate index
    // First, break it into chunks
    var postChunks = [];
    while (post_items.length > 0) {
      postChunks.push(post_items.splice(0, options.size));
    }

    // Then, loop through each chunk and write the content to the file
    for (var chunk in postChunks) {
      var data = {
        year: options.year,
        data: options.data,
        domain: options.domain,
        posts: []
      };

      // Get the posts
      for (post in postChunks[chunk]) {
        data.posts.push(postChunks[chunk][post]);
      }

      // Generate content
      if (Number(chunk) + 1 < postChunks.length) {
        data.nextChunk = Number(chunk) + 2;
      }
      if (Number(chunk) + 1 > 1) {
        data.prevChunk = Number(chunk);
      }
      data.recent_posts = recent_posts;
      output = indexTemplate(data);

      // If this is the first page, also write it as the index
      if (chunk === "0") {
        grunt.file.write(options.www.dest + '/index.html', output);
      }

      // Write the content to the file
      path = options.www.dest + '/posts/' + (Number(chunk) + 1);
      grunt.file.mkdir(path);
      grunt.file.write(path + '/index.html', output);
    }

  });
};
