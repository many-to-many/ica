
const gulp = require("gulp");
const compass = require("gulp-compass");
const concat = require("gulp-concat");
const sourcemaps = require("gulp-sourcemaps");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");
const babel = require("gulp-babel");
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require("browser-sync").create();

gulp.task("compass", function() {
  return gulp.src("styles/**/*.scss")
    .pipe(compass({
      css: "styles",
      sass: "styles/sass"
    }));
});

gulp.task("css", ["compass"], function () {
  return gulp.src("styles/**/*.css")
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: true
    }))
    .pipe(gulp.dest("app/assets"));
});

gulp.task("css-watch", ["css"], function () {
  browserSync.reload("*.css");
});

gulp.task("js", function () {
  return gulp.src(require("./scripts.json"))
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: [
        ["es2015", {
          modules: false
        }]
      ]
    }))
    .pipe(concat("main.js"))
    .pipe(uglify())
    .pipe(rename("main.min.js"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("app/assets"));
});

gulp.task("js-watch", ["js"], function () {
  browserSync.reload("*.js");
});

gulp.task("quill", function () {
  return gulp.src([
    "node_modules/quill/dist/quill.min.js",
    "node_modules/quill/dist/quill.min.js.map"
  ])
    .pipe(gulp.dest("app/assets"));
});

gulp.task("plyr", function () {
  return gulp.src("node_modules/plyr/dist/plyr.js")
    .pipe(gulp.dest("app/assets"));
});

gulp.task("build", ["quill", "plyr", "compass", "css", "js"]);

gulp.task("proxy", ["build"], function () {
  var config = require("./config.json");

  browserSync.init({
    proxy: config.proxy
  });

  gulp.watch("**/*.html").on("change", function () {
    browserSync.reload();
  });
  gulp.watch("styles/**/*.scss", ["css-watch"]);
  gulp.watch("scripts/**/*.js", ["js-watch"]);
});

gulp.task("default", ["proxy"]);
