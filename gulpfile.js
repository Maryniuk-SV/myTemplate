var gulp           = require('gulp'),
		less           = require('gulp-less'),
		browserSync    = require('browser-sync'),
		concat         = require('gulp-concat'),
		uglify         = require('gulp-uglify'),      // Стиснення js файлів
		cleanCSS       = require('gulp-clean-css'),   // Стиснення css файлів
		rename         = require('gulp-rename'),
		del            = require('del'),              // Підключаемо бібліотеку для видалення файлів і папок
		imagemin       = require('gulp-imagemin'),
		pngquant 			 = require('imagemin-pngquant'),
		cache          = require('gulp-cache'),
		autoprefixer   = require('gulp-autoprefixer'),
		pug       	   = require("gulp-pug"),
		plumber 			 = require('gulp-plumber'),
		notify         = require("gulp-notify"),      // Виводить помилки при збірці Gulp у вигляді системних повідомлень 
		spritesmith 	 = require('gulp.spritesmith'); // Підключаемо бібліотеку для генерації спрайтів

// Скріпти проекту

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false,
	});
});

gulp.task('common-js', function() {
	return gulp.src([
		'app/js/common.js',
		])
	.pipe(concat('common.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('app/js'));
});

gulp.task('js', ['common-js'], function() {
	return gulp.src([
		// 'app/libs/jquery/dist/jquery.min.js',
		'app/js/common.min.js', // Завжди в кінці
		])
	.pipe(concat('scripts.min.js'))
	.pipe(uglify()) // Мінімізувати весь js (на вибір)
	.pipe(gulp.dest('app/js'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('pug', function() {
	return gulp.src('app/pug/index.pug')
	.pipe(pug({
		pretty: true
	}))
	.pipe(plumber())
	.pipe(gulp.dest('app'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('less', function() {
	return gulp.src('app/less/main.less')
	.pipe(less({outputStyle: 'expand'}).on("error", notify.onError()))
	.pipe(rename({suffix: '.min', prefix : ''}))
	.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Створюємо префікси
	.pipe(cleanCSS()) // Мінімізація css файлів
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('watch', ['less', 'js', 'browser-sync'], function() {
	gulp.watch('app/less/**/*.less', ['less']);
	gulp.watch(['app/libs/**/*.js', 'app/js/common.js'], ['js']);
	gulp.watch('app/*.html', browserSync.reload);
});

gulp.task('img', function() {
	return gulp.src('app/img/**/*') // Беремо всі зображения з app
		.pipe(cache(imagemin({		// Стискаємо їх з найкращими налаштуваннями з врахуванням кешування
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest('dist/img')); // Вивантажуємо на продакшен
});


gulp.task('clean', function() { 
	return del.sync('dist');       // Видаляємо папку dist перед збіркою
}); 


gulp.task('build', ['clean', 'img', 'less', 'js'], function() {

	var buildCss = gulp.src([					// Переносимо CSS стилі в продакшен
		'app/css/main.min.css'
		])
	.pipe(gulp.dest('dist/css'))

	var buildFonts = gulp.src('app/fonts/**/*')	// Переносимо шрифти в продакшен
	.pipe(gulp.dest('dist/fonts'))

	var buildJs = gulp.src('app/js/**/*')		// Переносимо скріпти в продакшен
	.pipe(gulp.dest('dist/js'))

	var buildHtml = gulp.src('app/*.html')		// Переносимо HTML в продакшен
	.pipe(gulp.dest('dist'));

});

gulp.task('sprite', function () {
	var spriteData = gulp.src('app/img/sprite/*.png').pipe(spritesmith({
		imgName: 'sprite.png',
		cssName: 'sprite.css'
	}));
	return spriteData.pipe(gulp.dest('app/img/sprite'));
});

gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('default', ['watch']);
