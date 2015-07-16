//Gulp plugins from NPM
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var connect = require('gulp-connect');
var del = require('del');
var gulp = require('gulp');
var karma = require('gulp-karma');
var minify = require('gulp-minify');
var minifyHTML = require('gulp-minify-html');
var mocha = require('gulp-mocha');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var util = require('gulp-util');


//------------------------------------------------------------------------------
//Defining directories

var directory = {};
//FROM
directory.client = {};
directory.client.root = './client/';
directory.client.html = directory.client.root + 'html/';
directory.client.js = directory.client.root + 'js/';
directory.client.jslib = directory.client.root + 'jslib/';
directory.client.scss = directory.client.root + 'scss/';

//TO (destination)
directory.dest = {};
directory.dest.build = './build/';
directory.dest.html = directory.dest.build + 'html/';
directory.dest.js = directory.dest.build + 'js/';
directory.dest.jslib = directory.dest.build + 'jslib/';
directory.dest.img = directory.dest.build + 'img/';
directory.dest.css = directory.dest.build + 'css/';

//TESTING
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
//A file is: directory/*.extension, such as: ./client/html/**/*.html
//files.js: my javascript files
//files.jslib: external javascript libraries, dependencies

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

//The old dev and build files must be cleaned, deleted before every build
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
    .pipe(gulp.dest(directory.dest.html))
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
    .pipe(babel())
    .pipe(gulp.dest(directory.dest.jslib));
});

gulp.task('build:js', function () {
  return gulp.src([files.js])
    .pipe(plumber())
    .pipe(babel())
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(minify())
    .pipe(rename('all.min.js'))
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
