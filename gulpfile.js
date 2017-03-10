
var gulp = require("gulp");
var compass = require("gulp-compass");
var concat = require("gulp-concat");
var strip = require("gulp-strip-comments");
var browserSync = require("browser-sync").create();
var config = require("./config.json");

gulp.task("compass", function() {
  return gulp.src("styles/**/*.scss")
    .pipe(compass({
      css: "styles",
      sass: "styles/sass"
    }));
});

gulp.task("css", ["compass"], function () {
  return gulp.src("styles/**/*.css")
    .pipe(gulp.dest("app/assets"));
});

gulp.task("css-watch", ["css"], function () {
  browserSync.reload("*.css");
});

gulp.task("js", function () {
  return gulp.src(require("./scripts.json"))
    .pipe(concat("main.js"))
    .pipe(strip({trim: true}))
    .pipe(gulp.dest("app/assets"));
});

gulp.task("js-watch", ["js"], function () {
  browserSync.reload("*.js");
});

gulp.task("quill", function () {
  return gulp.src("node_modules/quill/dist/quill.min.js")
    .pipe(concat("quill.js"))
    .pipe(gulp.dest("app/assets"));
});

gulp.task("build", ["compass", "css", "quill", "js"]);

gulp.task("proxy", ["build"], function () {
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
