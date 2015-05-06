'use strict';

var browserify = require('browserify')
		, source = require('vinyl-source-stream')
		, buffer = require('vinyl-buffer')
		, gulp = require('gulp')
		, clean = require('gulp-clean')
		, concat = require('gulp-concat')
		, connect = require('gulp-connect')
		, sass = require('gulp-sass')
		/*, rename = require('gulp-rename')*/
		, open = require('gulp-open')
		/*, streamify = require('gulp-streamify')*/
		, uglify = require('gulp-uglify')
		, sourcemaps = require('gulp-sourcemaps')
		, replaceHtml = require('gulp-html-replace')
		;

var liveReload = true;
var serverPort = 8000;

gulp.task('clean', function () {
	return gulp.src(
			[
				'./dist/'
			],
			{
				read: false
			}
	).pipe(
			clean()
	);
});

gulp.task('browserify', /*['lint', 'unit'],*/ function () {
	browserify(
			'./src/js/app.js'
	).bundle(
			{debug: true}
	).on(
			'error',
			function (err) {
				console.log(err.message);
			}
	).pipe(
			source('app.bundler.js')
	).pipe(
			buffer()
	).pipe(
			sourcemaps.init({loadMaps: true})
	).pipe(
			sourcemaps.write('./')
	).pipe(
			gulp.dest('./src/js/')
	);
});

gulp.task('browserify:dist', /*[ng-annotate],*/ function () {
	browserify(
			'./src/js/app.js'
	).bundle(
			{debug: true}
	).pipe(
			source('app.min.js')
	).pipe(
			buffer()
	).pipe(
			uglify()
	).pipe(
			gulp.dest('./dist/js/')
	);
});

gulp.task('concat:dev', function () {
	gulp.src([
		'./src/vendor/angular/angular.js',
		'./src/vendor/angular-route/angular-route.js',
		'./src/vendor/localforage/dist/localforage.js',
		'./src/vendor/ng-cordova-common/dist/common.js',
		'./src/vendor/mobile-angular-ui/dist/js/mobile-angular-ui.js'
	]).pipe(
			concat('lib.bundler.js')
	).pipe(
			gulp.dest('./src/js/')
	);
});

gulp.task('concat:dist', function () {
	gulp.src([
		'./src/vendor/angular/angular.min.js',
		'./src/vendor/angular-route/angular-route.min.js',
		'./src/vendor/localforage/dist/localforage.min.js',
		'./src/vendor/ng-cordova-common/dist/common.min.js',
		'./src/vendor/mobile-angular-ui/dist/js/mobile-angular-ui.min.js'
	]).pipe(
			concat('lib.min.js')
	).pipe(
			gulp.dest('./dist/js/')
	);
	gulp.src([
		'./src/css/*.css',
		'./src/vendor/mobile-angular-ui/dist/css/mobile-angular-ui-base.min.css'
	]).pipe(
			concat('app.min.css')
	).pipe(
			gulp.dest('./dist/css/')
	);
});

gulp.task('copy:dist', function () {
	gulp.src(
			'./src/page/**/*'
	).pipe(
			gulp.dest('./dist/page/')
	);
	gulp.src(
			'./src/img/**/*'
	).pipe(
			gulp.dest('./dist/img/')
	);
	gulp.src(
			'src/res/**/*'
	).pipe(
			gulp.dest('dist/res')
	);
	gulp.src([]).pipe(
			gulp.dest('./dist/fonts/')
	);
});

gulp.task('scss', function () {
	gulp.src(
			'./src/scss/app.scss'
	).pipe(
			sass({errLogToConsole: true})
	).pipe(
			gulp.dest('./src/css/')
	);
});

gulp.task('replace-html', function () {
	gulp.src(
			'./src/index.html'
	).pipe(
			replaceHtml({
				'css': 'css/app.min.css',
				'js': [
					'js/lib.min.js',
					'js/app.min.js'
				]
			})
	).pipe(
			gulp.dest('./dist/')
	);
});

gulp.task('watch', function () {
	gulp.watch(
			[
				'src/js/**/*.js',
				'!src/js/lib.bundler.js',
				'!src/js/app.bundler.js'
			],
			['browserify']
	);
	gulp.watch('./src/scss/**/*.scss', ['scss']);
});

gulp.task('server', function () {
	connect.server({
		livereload: liveReload,
		root: 'src',
		port: serverPort
	});
});

gulp.task('open-browser', function () {
	var options = {
		//app: "google-chrome",
		url: "http://localhost:" + serverPort
	};
	gulp.src(
			"./src/index.html"
	).pipe(
			open("", options)
	);
});

gulp.task('default', ['clean'], function () {
	liveReload = false;
	gulp.start('common');
});

gulp.task('common', ['concat:dev', 'browserify', 'scss']);

//development
gulp.task('dev', ['common', 'watch', 'server'], function () {
	gulp.start('open-browser');
});

//for distribute
gulp.task('dist', ['clean'], function () {
	gulp.start('scss', 'browserify:dist', 'concat:dist', 'copy:dist', 'replace-html');
});

