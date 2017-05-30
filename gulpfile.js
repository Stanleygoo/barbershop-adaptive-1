var gulp = require('gulp'), // подключаем пакеты Gulp из папки node_modules в наш проект
    less = require('gulp-less'), // Подключаем Less пакет
    watch = require('gulp-watch'), // Подключаем watch пакет
    browserSync = require('browser-sync'), // Подключаем browser-sync пакет
    concat = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
    uglify = require('gulp-uglify'), // Подключаем gulp-uglifyjs (для минификации JS)
    cssnano = require('gulp-cssnano'), // подключаем gulp-cssnano (для минификации css)
    rename = require('gulp-rename'); // подключаем gulp-rename (для переименования файлов)
    del = require('del'), // подключаем библиотеку для удаления файлов и папок
    imagemin = require('gulp-imagemin'), // подключаем библиотеку для работы с изображениями
    pngquant = require('imagemin-pngquant'), // подключаем библиотеку для работы с png
    cache = require('gulp-cache'); // подключаем библиотеку кеширования
    autoprefixer = require('gulp-autoprefixer');// Подключаем библиотеку для автоматического добавления префиксов

gulp.task('less', function () { // Создаем таск "less"
  return gulp.src([
    'app/less/style.less',
    'app/less/libs.less',
    'app/less/normalize.less'
    ]) // Берем все Less-файлы из папки less и дочерних, если таковые будут
    .pipe(less()) // Преобразуем less в CSS посредством gulp-less
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
    .pipe(gulp.dest('./app/css')) // Выгружаем результата в папку app/css
    .pipe(browserSync.reload({stream: true})); // Обновляем CSS на странице при изменении
});

gulp.task('css-libs', ['less'], function() { //Таск less лучше вызвать до запуска css-libs, чтобы нам было что минифицировать
  return gulp.src([
    'app/css/libs.css',
    'app/css/style.css',
    'app/css/normalize.css'
    ]) // выбираем файлы для минификации
    .pipe(cssnano()) //минифицируем
    .pipe(rename({suffix: '.min'})) //добавляем суффикс .min
    .pipe(gulp.dest('app/css')); // выгружаем в папку app/css
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
  browserSync({ // Выполняем browser Sync
    server: { // Определяем параметры сервера
      baseDir: 'app' // Директория для сервера - app
    },
    notify: false // Отключаем уведомления
  });
});

gulp.task('scripts', function() {
    return gulp.src([ // Берем все необходимые библиотеки
        'app/libs/jquery/dist/jquery.min.js', // Берем jQuery
        'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js', // Берем Magnific Popup
        'app/libs/fitvids/jquery.fitvids.js'
        ])
        .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
        .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
});
gulp.task('jsmin', function() {
  return gulp.src([
    'app/js/main.js',
    ]) // выбираем файлы для минификации
    .pipe(uglify()) //минифицируем
    .pipe(rename({suffix: '.min'})) //добавляем суффикс .min
    .pipe(gulp.dest('app/js')); // выгружаем в папку app/css
});

gulp.task('watch', ['browser-sync', 'css-libs', 'scripts', 'jsmin'], function () {
  gulp.watch('app/less/**/*.less', ['less']); // Наблюдение за less-файлами
  // gulp.watch('app/css/**/*.css', ['css-libs']); // Наблюдение за less-файлами
  gulp.watch('app/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
  gulp.watch('app/js/**/*.js', browserSync.reload); // Наблюдение за JS файлами в папке js
    //add watch for Наблюдения за другими типами файлов
});

gulp.task('clean', function() {
    return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('img', function() {
    return gulp.src('app/img/**/*') // Берем все изображения из app
        .pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});

gulp.task('build', ['clean', 'img', 'less', 'scripts'], function() {

    var buildCss = gulp.src([ // Переносим CSS стили в продакшен
        'app/css/*.min.css',
        ])
    .pipe(gulp.dest('dist/css'))

    var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
    .pipe(gulp.dest('dist/fonts'))

    var buildJs = gulp.src('app/js/*.min.js') // Переносим скрипты в продакшен
    .pipe(gulp.dest('dist/js'))

    var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
    .pipe(gulp.dest('dist'));

    var buildMedia = gulp.src('app/media/**/*') // Переносим media в продакшен
    .pipe(gulp.dest('dist/media'));

});

gulp.task('default', ['watch']);
gulp.task('clear', function () {
    return cache.clearAll();
})
