const gulp = require('gulp');
const less = require('gulp-less');
const livereload = require('gulp-livereload');

gulp.task('less', () => {
    gulp.src('render/less/main.less')
        .pipe(less())
        .pipe(gulp.dest('render/css'))
        .pipe(livereload());
});

gulp.task('watch', () => {
    livereload.listen();
    gulp.watch('render/less/**/*.less', ['less']);
});

gulp.task('default', ['watch']);
