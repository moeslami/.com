// Definitions
var gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  plumber = require('gulp-plumber'),
  livereload = require('gulp-livereload'),
  less = require('gulp-less'),
  ts = require('gulp-typescript'),
  merge = require('merge2'),
  inlineNg2Template = require('gulp-inline-ng2-template'),
  ghPages = require('gulp-gh-pages'),
  htmlMinifier = require('html-minifier'),
  less = require('less'),
  concat = require('gulp-concat');

// tasks

gulp.task('build-less', function () {});
// gulp.task('build-less', function () {
//   gulp.src('./app/**/*.less')
//     .pipe(plumber())
//     .pipe(less())
//     .pipe(gulp.dest('./css'));
//   // .pipe(livereload());
// });

var tsProject = ts.createProject('tsconfig.json');

gulp.task('build-app', function () {    
  
  var tsResult = gulp.src('app/**/*.ts')
    .pipe(inlineNg2Template(
      {
        base: '/app',          // Angular2 application base folder 
        html: true,         // Process .html files 
        css: true,          // Process .css files 
        target: 'es6',       // Can swap to es5 
        indent: 2,          // Indentation (spaces) 
        templateProcessor: function (ext, file, cb) {
          try {
            
            var minifiedFile = htmlMinifier.minify(file, {
              collapseWhitespace: true,
              caseSensitive: true,
              removeComments: true,
              removeRedundantAttributes: true
            });
            cb(null, minifiedFile);
          }
          catch (err) {
            
            cb(err);
          }
        },
        styleProcessor: function (ext, file, cb) {
          try {
            less.render(require(file), {
              //filename: file.css, // Specify a filename, for better error messages
              compress: true          // Minify CSS output
            },
              function (e, output) {
                
                cb(null, output.css);
              })

          } catch (err) {
            cb(err);
          }
        }
        //customFilePath: function (ext, file) {/* ... */ }
      }))
    .pipe(ts(tsProject))
    .pipe(gulp.dest('bin'));

  // return merge([ // Merge the two output streams, so this task is finished when the IO of both operations are done. 
  //   tsResult.dts.pipe(gulp.dest('bin/definitions')),
  //   tsResult.js.pipe(gulp.dest('bin'))
  // ])
  //.pipe(livereload());
});

gulp.task('bundle-vendor', function () {
  return gulp.src([
    'node_modules/es6-shim/es6-shim.min.js',
    'node_modules/systemjs/dist/system-polyfills.js',
    'node_modules/angular2/bundles/angular2-polyfills.js',
    'node_modules/systemjs/dist/system.src.js',
    'node_modules/rxj s/bundles/Rx.min.js',
    'node_modules/angular2/bundles/angular2.dev.js',
    'node_modules/bootstrap/dist/css/bootstrap.min.css',
    'node_modules/bootstrap/dist/js/bootstrap.min.js',
    'node_modules/ng2-bootstrap/bundles/ng2-bootstrap.min.js',
    'js/jquery.quicksand.js',
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/moment/min/moment.min.js',
    'node_modules/angular2/bundles/http.dev.js',
    'node_modules/angular2-cookie/bundles/angular2-cookie.min.js',
    'node_modules/angular2-modal/dist/systemjs/angular2-modal-0.1.0.min.js'

    //'js/*.js'
  ])
  .pipe(concat('./bin/vendor.min.js'))
  .pipe(gulp.dest('bin/vendor'));

});
// gulp.task('copy-lib', function () {
//   return gulp.src([
//     'node_modules/es6-shim/es6-shim.min.js',
//     'node_modules/systemjs/dist/system-polyfills.js',
//     'node_modules/angular2/bundles/angular2-polyfills.js',
//     'node_modules/systemjs/dist/system.src.js',
//     'node_modules/rxj s/bundles/Rx.min.js',
//     'node_modules/angular2/bundles/angular2.dev.js',
//     'node_modules/bootstrap/dist/css/bootstrap.min.css',
//     'node_modules/bootstrap/dist/js/bootstrap.min.js',
//     'node_modules/ng2-bootstrap/bundles/ng2-bootstrap.min.js',
//     'js/jquery.quicksand.js',
//     'node_modules/jquery/dist/jquery.min.js',
//     'node_modules/moment/min/moment.min.js',
//     'node_modules/angular2/bundles/http.dev.js',
//     'node_modules/angular2-cookie/bundles/angular2-cookie.min.js',
//     'node_modules/angular2-modal/dist/systemjs/angular2-modal-0.1.0.min.js'

//     //'js/*.js'
//   ])
//     .pipe(gulp.dest('lib'));
// });


// gulp.task('deploy', ['build', 'copy-lib'], function () {
//   return gulp.src([
//     'css/**',
//     'font-awesome/**',
//     'fonts/**',
//     'images/**',
//     'lib/**',
//     'bin/**',
//     'dashboard/**',
//     'index.html'
//   ], { "base": "." })
//     .pipe(ghPages({ force: true }));
// });

gulp.task('watch', function(){});
// gulp.task('watch', ['build', 'copy-lib'], function () {
//   gulp.watch('./css/*.less', ['build-less']);
//   gulp.watch('./app/**/*', ['build-app']);
// });

gulp.task('develop', ['build', 'watch'], function () {
  // livereload.listen();
  nodemon({
    script: 'local-server.js',
    ext: 'js html',
    stdout: false
  }).on('readable', function () {
    this.stdout.on('data', function (chunk) {
      if (/^Express server listening on port/.test(chunk)) {
        livereload.changed(__dirname);
      }
    });
    this.stdout.pipe(process.stdout);
    this.stderr.pipe(process.stderr);
  });
});
gulp.task('build', [
  'build-less',
  'build-app'
]);

gulp.task('default', [
  'develop',
  'watch'
]);