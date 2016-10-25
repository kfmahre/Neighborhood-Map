var gulp = require('gulp');
var minifyCss = require('gulp-minify-css');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var concat = require('gulp-concat');

var cssFiles = 'css/main.scss';

gulp.task('sass', function(){
  gulp.src(cssFiles)
    .pipe(sass().on('error', sass.logError))
    .pipe(minifyCss())
    .pipe(concat('main.css'))
    .pipe(gulp.dest('css/'));
});

gulp.task('watch', function(){
  gulp.watch('Portfolio/css/*.scss', ['sass']);
})

gulp.task('init', ['sass']);
gulp.task('default', ['sass']);