var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var rm = require('gulp-rimraf');
var connect = require('gulp-connect');
var open = require('gulp-open');

var serverPort = 5100;

gulp.task('clean', function() {
    return gulp.src('./dist/*').pipe(rm());
});

gulp.task('concat', ['clean'], function() {
    return gulp.src(['./src/index.js', './src/config.js', './src/util/*.js', './src/component/*.js'])
        .pipe(concat('common.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('compress', ['concat'], function() {
    gulp.src('./dist/common.js')
        .pipe(rename('common.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/'));
});

gulp.task('server', function () {
    connect.server({
        livereload: true,
        root: [__dirname],
        port: serverPort
    });
});

gulp.task('open-browser', function () {
    var options = {
        //app: "google-chrome",
        url: "http://localhost:" + serverPort + '/test/index.html'
    };
    gulp.src(
        "./test/index.html"
    ).pipe(
        open("", options)
    );
});

gulp.task('watch', function () {
    gulp.watch(
        [
            'src/**/*.js'
        ],
        ['concat']
    );
});

gulp.task('default', ['compress']);

gulp.task('dev', ['compress', 'server', 'watch'], function () {
    gulp.start('open-browser');
});