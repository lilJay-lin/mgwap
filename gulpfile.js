/**
 * Created by linxiaojie on 2015/10/14.
 */
var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    zip = require('gulp-zip'),
    del = require('del'),
    gulpSequence = require('gulp-sequence'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    browserify = require('browserify'),
    browserSync = require('browser-sync');



gulp.task('build',function(){
    return browserify('./app.js').bundle()
        .pipe(source('mgapp.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('./src/c'));
});

gulp.task('watch',function(){
   gulp.watch(['./js/*.js'],['build']);
});

gulp.task('appServer',function(){

    var files = [
        './src/c'
    ];

    browserSync.init(files, {
        server: {
            baseDir: './src/c'
        }
    });
});

/*
    ���
 */
gulp.task('archive:clean', function(){
    del(
        [
            './src/temp/**'
        ]
    );
});

gulp.task('archive:copy',function(){
    return gulp.src('./src/c/**')
       .pipe(gulp.dest('./src/temp/c'));
});

gulp.task('archive:zip', function(){
    return gulp.src('./src/temp/**')
        .pipe(zip('archive.zip'))
        .pipe(gulp.dest('./src/zip'));
});

gulp.task('archive',function(cb){
    gulpSequence(
        'archive:copy',
        'archive:zip',
        'archive:clean',
        cb
    );
});


gulp.task('default', ['build', 'watch']);

gulp.task('preview', ['build', 'watch', 'appServer']);

gulp.task('zip', ['archive']);