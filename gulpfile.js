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
//Defining DIRectories
var dir = {};
dir.client = {};
dir.client.root = './client/';
dir.client.html = dir.client.root + 'html/';
dir.client.js = dir.client.root + 'js/';
dir.client.jslib = dir.client.root + 'lib/';
dir.client.scss = dir.client.root + 'scss/';
dir.dest = {};
dir.dest.build = './build/';
dir.dest.js = dir.dest.build + 'js/';
dir.dest.img = dir.dest.build + 'img/';
dir.dest.css = dir.dest.build + 'css/';
dir.test = {};
dir.test.root = './test/';
dir.test.api = dir.test.root + 'api/';
dir.test.browser = dir.test.root + 'browser/';

//------------------------------------------------------------------------------
//Defining file EXTensions
var ext = {};
ext.html = '**/*.{htm,html}';
ext.js = '**/*.js';
ext.css = '**/*.css';
ext.scss = '**/*.scss';
ext.bundle = 'bundle.js';

//------------------------------------------------------------------------------
//Defining specific files in specific folders
var files = {};
files.html = dir.client.html + ext.html;
files.js = dir.client.js + ext.js;
files.jslib = dir.client.jslib + ext.js;
files.scss = dir.client.scss + ext.scss;
files.test = {};
files.test.api = dir.test.api + ext.js;
files.test.browser = dir.test.browser + ext.js;

//------------------------------------------------------------------------------
//Defining Gulp-tasks, which are the steps of the building-process

gulp.task('clean', function (cb) {
  return del([dir.dest.build], cb);
});

gulp.task('copy:html', function () {
  return gulp.src([files.html])
    .pipe(plumber())
    .pipe(minifyHTML({
      conditionals: true,
      spare: true
    }))
    .pipe(gulp.dest(dir.dest.build))
    .pipe(connect.reload());
});

gulp.task('build:css', function () {
  return gulp.src([files.scss])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dir.dest.css))
    .pipe(connect.reload());
});

gulp.task('copy:js-lib', function () {
  return gulp.src([files.jslib])
    .pipe(gulp.dest(dir.dest.js));
});

gulp.task('build:js', function () {
  return gulp.src([files.js])
    .pipe(plumber())
    .pipe(uglify())
    .pipe(gulp.dest(dir.dest.js))
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
    root: [dir.dest.build],
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
