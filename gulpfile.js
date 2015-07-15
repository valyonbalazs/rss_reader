//Gulp plugins from NPM
var gulp = require('gulp');
var runSequence = require('run-sequence');
var plumber = require('gulp-plumber');
var del = require('del');
var minifyHTML = require('gulp-minify-html');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var connect = require('gulp-connect');
var util = require('gulp-util');
var mocha = require('gulp-mocha');
var karma = require('gulp-karma');

//------------------------------------------------------------------------------
//Defining directories
var directory = {};
directory.client = {};
directory.client.root = './client/';
directory.client.html = directory.client.root + 'html/';
directory.client.js = directory.client.root + 'js/';
directory.client.jslib = directory.client.root + 'lib/';
directory.client.scss = directory.client.root + 'scss/';
directory.dest = {};
directory.dest.build = './build/';
directory.dest.js = directory.dest.build + 'js/';
directory.dest.img = directory.dest.build + 'img/';
directory.dest.css = directory.dest.build + 'css/';
directory.test = {};
directory.test.root = './test/';
directory.test.api = directory.test.root + 'api/';
directory.test.browser = directory.test.root + 'browser/';

//------------------------------------------------------------------------------
//Defining file EXTensions
var extension = {};
extension.html = '**/*.{htm,html}';
extension.js = '**/*.js';
extension.css = '**/*.css';
extension.scss = '**/*.scss';
extension.bundle = 'bundle.js';

//------------------------------------------------------------------------------
//Defining specific files in specific folders
var files = {};
files.html = directory.client.html + extension.html;
files.js = directory.client.js + extension.js;
files.jslib = directory.client.jslib + extension.js;
files.scss = directory.client.scss + extension.scss;
files.test = {};
files.test.api = directory.test.api + extension.js;
files.test.browser = directory.test.browser + extension.js;

//------------------------------------------------------------------------------
//Defining Gulp-tasks, which are the steps of the building-process

gulp.task('clean', function (cb) {
  return del([directory.dest.build], cb);
});

gulp.task('copy:html', function () {
  return gulp.src([files.html])
    .pipe(plumber())
    .pipe(minifyHTML({
      conditionals: true,
      spare: true
    }))
    .pipe(gulp.dest(directory.dest.build))
    .pipe(connect.reload());
});

gulp.task('build:css', function () {
  return gulp.src([files.scss])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(directory.dest.css))
    .pipe(connect.reload());
});

gulp.task('copy:js-lib', function () {
  return gulp.src([files.jslib])
    .pipe(gulp.dest(directory.dest.js));
});

gulp.task('build:js', function () {
  return gulp.src([files.js])
    .pipe(plumber())
    .pipe(uglify())
    .pipe(gulp.dest(directory.dest.js))
    .pipe(connect.reload());
});

gulp.task('build', function (cb) {
  runSequence(
    'clean',
    ['build:css','build:js'],
    ['copy:html','copy:js-lib'],
    cb
  );
});

gulp.task('connect', function () {
  connect.server({
    root: [directory.dest.build],
    port: 80,
    livereload: true
  });
});

gulp.task('watch', ['build', 'connect'], function () {
  util.log(util.colors.yellow('Watching html, scss, js files'));
  gulp.watch(files.html, ['copy:html']);
  gulp.watch(files.scss, ['build:css']);
  gulp.watch(files.js, ['build:js']);
});

gulp.task('test:api', function(){
  return gulp.src(files.test.api)
    .pipe(plumber())
    .pipe(mocha({
      ui: 'tdd',
      reporter: 'spec'
    }));
});

gulp.task('test:browser', function(){
  return gulp.src(files.test.browser)
    .pipe(plumber())
    .pipe(karma({
      configFile: './test/karma.conf.js',
      action: 'run'
    }));
});

gulp.task('test', function (cb) {
  runSequence(
    'test:api',
    'test:browser',
    cb
  );
});

gulp.task('default', ['build']);
