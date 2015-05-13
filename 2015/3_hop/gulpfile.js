var gulp = require('gulp');
var babel = require('gulp-babel');
var react = require('gulp-react');
var less = require('gulp-less');

gulp.task('lib', function() {
    gulp.src('./src/lib/**/*')
        .pipe(gulp.dest('./build/lib'));
});

gulp.task('html', function() {
    gulp.src('./src/html/index.html')
        .pipe(gulp.dest('./build'));
});

gulp.task('javascript', function() {
    gulp.src('./src/js/**/*')
        .pipe(babel({
            modules: 'amd'
        }))
        .pipe(react())
        .pipe(gulp.dest('./build/js'));
});

gulp.task('less', function() {
    gulp.src('./src/css/hop.less')
        .pipe(less())
        .pipe(gulp.dest('./build/css'));
});

gulp.task('default', ['lib', 'html', 'javascript', 'less'], function() {

});