var gulp = require('gulp'),
	concat = require('gulp-concat'),
	notify = require('gulp-notify'),
	watch = require('gulp-watch'),	
	compass = require('gulp-sass'),
	rename = require('gulp-rename'),
	autoprefixer = require('gulp-autoprefixer'),
	useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    cleanCss = require('gulp-clean-css'),
	gulpIgnore = require('gulp-ignore');
 

gulp.task('scss', function() {
	
	gulp.src('app/scss/*.scss')	
	.pipe(compass({
            sassDir: 'scss',
            cssDir: 'css',
            force: true
        }))
	.pipe(concat('all.css'))
	.pipe(autoprefixer({
            browsers: ['last 16 versions'],
            cascade: false
        }))
	.pipe(gulp.dest('./app/css/'))
	.pipe(notify('Done css!'));
})

/*gulp.task('html', function(){
	gulp.src('./app/src/*.html')
	 .pipe(gulp.dest('./app/dest/'))
	 .pipe(notify('Done html!'));
})*/

gulp.task('default', ['scss'/*, 'js', 'html'*/], function(){
	gulp.watch('app/scss/*.scss', ['scss']);
	/*gulp.watch('app/src/js/*.js',['js']);
	gulp.watch('app/*.html', app/ua/*html, ['html']);	*/
})

// PRODUCTION	
	
gulp.task('useref', function () {	 
    gulp.src('app/*.html')
        .pipe(useref())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', cleanCss({compatibility: 'ie8'})))
        .pipe(gulp.dest('dist'));	
});

gulp.task('useref-ua', function () {	 
    gulp.src('app/ua/*.html')
        .pipe(useref())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', cleanCss({compatibility: 'ie8'})))
        .pipe(gulp.dest('dist/ua/'));	
});

gulp.task('image', function(){
	gulp.src('./app/images/*')
	 .pipe(gulp.dest('./dist/images/'))
	 .pipe(notify('Done image!'));
});

gulp.task('fonts', function(){
	gulp.src('./app/fonts/**')
	 .pipe(gulp.dest('./dist/fonts/'))
	 .pipe(notify('Done fonts!'));
});

gulp.task('api', function(){
	gulp.src('./app/api/*.*')
	 .pipe(gulp.dest('./dist/api/'))
	 .pipe(notify('Done api!'));
});

gulp.task('other', function(){
	gulp.src('./app/*.png', './app/*.svg', './app/*.ico', './app/type_project/*')	 
	 .pipe(gulp.dest('./dist/'))
	 .pipe(notify('Done other!'));
});


gulp.task('production', ['useref', 'useref-ua', 'image', 'fonts', 'api', 'other'], function(){
	
});
