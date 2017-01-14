
var gulp = require('gulp');
var compass = require('gulp-compass');
var concat = require('gulp-concat');
var browserSync = require('browser-sync').create();
var config = require('./config.json');

gulp.task('compass', function() {
  gulp.src('styles/**/*.scss')
    .pipe(compass({
      css: 'styles',
      sass: 'styles/sass',
      task: 'watch'
    }))
});

gulp.task('css', function () {
  return gulp.src('styles/**/*.css')
    .pipe(gulp.dest('app/assets'));
});

gulp.task('css-watch', ['css'], function () {
  browserSync.reload('*.css');
});

gulp.task('js', function () {
  return gulp.src(require('./scripts.json'))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('app/assets'));
});

gulp.task('js-watch', ['js'], function () {
  browserSync.reload('*.js');
});

gulp.task('proxy', ['compass', 'css', 'js'], function () {
  browserSync.init({
      proxy: config.proxy
  });

  gulp.watch('**/*.html').on("change", function () {
    browserSync.reload();
  });
  gulp.watch('styles/**/*.css', ['css-watch']);
  gulp.watch('scripts/**/*.js', ['js-watch']);
});

gulp.task('default', ['proxy']);
