
const gulp = require("gulp");
const compass = require("gulp-compass");
const concat = require("gulp-concat");
const sourcemaps = require("gulp-sourcemaps");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");
const babel = require("gulp-babel");
const autoprefixer = require("gulp-autoprefixer");
const browserSync = require("browser-sync").create();
const plumber = require("gulp-plumber");

// Styles

gulp.task("compass", function() {
  return gulp.src("./styles/**/*.scss")
    .pipe(plumber())
    .pipe(compass({
      css: "./tmp/styles",
      sass: "./styles"
    }));
});

gulp.task("styles", ["compass"], function () {
  return gulp.src("./tmp/styles/**/*.css")
    .pipe(plumber())
    .pipe(autoprefixer({
      browsers: ["last 2 versions"],
      cascade: true
    }))
    .pipe(gulp.dest("./app/styles"));
});

gulp.task("styles-watch", ["styles"], function () {
  browserSync.reload("*.css");
});

// Scripts

gulp.task("scripts", function () {
  return gulp.src(require("./scripts.json"))
    .pipe(plumber())
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
    .pipe(gulp.dest("./app/scripts"));
});

gulp.task("scripts-watch", ["scripts"], function () {
  browserSync.reload("*.js");
});

// Vendor

gulp.task("vendor", function () {
  return gulp.src([
    "./node_modules/quill/dist/quill.min.js",
    "./node_modules/plyr/dist/plyr.js",
    "./node_modules/linkifyjs/dist/linkify.js",
    "./node_modules/linkifyjs/dist/linkify-element.js",
    "./node_modules/jdenticon/dist/jdenticon.min.js"
  ])
    .pipe(concat("vendor.js"))
    .pipe(gulp.dest("./app/scripts"));
});

// Tasks

gulp.task("build", ["vendor", "compass", "styles", "scripts"]);

gulp.task("proxy", ["build"], function () {
  var config = require("./config.json");

  browserSync.init({
    proxy: config.proxy,
    ghostMode: false
  });

  gulp.watch("./app/**.html").on("change", function () {
    browserSync.reload();
  });
  gulp.watch("./styles/**", ["styles-watch"]);
  gulp.watch("./scripts/**", ["scripts-watch"]);
});

gulp.task("default", ["proxy"]);
