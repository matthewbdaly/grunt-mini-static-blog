# grunt-mini-static-blog

> Grunt plugin for creating a static blog

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-mini-static-blog --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-mini-static-blog');
```

## The "mini_static_blog" task

### Overview
In your project's Gruntfile, add a section named `mini_static_blog` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
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
```
