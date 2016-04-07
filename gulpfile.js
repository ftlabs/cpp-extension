'use strict';
const gulp = require('gulp');
const obt = require('origami-build-tools');

gulp.task('build-extension-main', ['copy-extension-files'], function () {

	return obt.build(gulp, {
		js: './extension/scripts/main.js',
		buildJs: 'main.js',
		buildFolder: './extension-dist/scripts/'
	});
});

gulp.task('build-extension-background', ['copy-extension-files'], function () {

	return obt.build(gulp, {
		js: './extension/scripts/background.js',
		buildJs: 'background.js',
		buildFolder: './extension-dist/scripts/'
	});
});

gulp.task('build-extension-popup', ['copy-extension-files'], function () {

	return obt.build(gulp, {
		js: './extension/scripts/popup.js',
		buildJs: 'popup.js',
		buildFolder: './extension-dist/scripts/'
	});
});

gulp.task('build-extension', ['build-extension-main', 'build-extension-background', 'build-extension-popup'], function () {

	return gulp.src('./extension-dist/scripts/*.js')
		.pipe(gulp.dest('./extension-dist/scripts/'))
	;

});

gulp.task('copy-extension-files', ['copy-extension-images'], function () {

	return gulp.src([
		'extension/*'
	])
	.pipe(gulp.dest('./extension-dist/'));

});

gulp.task('copy-extension-images', function () {

	return gulp.src([
		'extension/images/*'
	])
	.pipe(gulp.dest('./extension-dist/images/'));

});
