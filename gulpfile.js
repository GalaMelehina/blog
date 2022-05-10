const {task, src, dest, parallel, series} = require('gulp');
const browserSync = require('browser-sync').create();
const watch = require('gulp-watch');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const gcmq = require('gulp-group-css-media-queries');
const sassGlob = require('gulp-sass-glob');
const pug = require('gulp-pug');
const del = require('del');
const fs = require('fs');

// Сборка pug-файлов
task('pug', function(callback) {
    return src('./src/pug/pages/**/*.pug')
        .pipe( plumber({
            errorHandler: notify.onError(function(err){
                return {
                    title: 'Pug',
                    sound: false,
                    message: err.message
                }
            })
        }) )
        .pipe( pug({
            pretty: true,
            locals: {
                jsonData: JSON.parse(fs.readFileSync('./src/data/html-data.json', 'utf8')),
                footerList: JSON.parse(fs.readFileSync('./src/data/footer-list.json', 'utf8')),
            }
        }) )
        .pipe( dest('./build/') )
        .pipe( browserSync.stream() );
    callback();
});

// Компиляция scss в css
task('scss', function(callback) {
    return src('./src/scss/main.scss')
        .pipe( plumber({
            errorHandler: notify.onError(function(err){
                return {
                    title: 'Styles',
                    sound: false,
                    message: err.message
                }
            })
        }) )
        .pipe( sourcemaps.init() )
        .pipe( sassGlob() )
        .pipe( 
            sass({
                indentType: "tab",
                indentWidth: 1,
                outputStyle: "expanded"
        }) )
        .pipe( gcmq() )
        .pipe( autoprefixer({
            overrideBrowserslist: ['last 4 version']
        }) )
        .pipe( sourcemaps.write() )
        .pipe( dest('./build/css/') )
        .pipe( browserSync.stream() );
    callback();
});

// Копирование изображений
task('copy:img', function(callback) {
    return src('./src/img/**/*.*')
        .pipe( dest('./build/img/') )
    callback();
});

// Копирование скриптов
task('copy:js', function(callback) {
    return src('./src/js/**/*.*')
        .pipe( dest('./build/js/') )
    callback();
});

// Слежение за файлами
task('watch', function () {

    watch(['./build/img/**/*.*', './build/js/**/*.*'], parallel( browserSync.reload) );

    watch('./src/scss/**/*.scss', parallel('scss'));

    watch(['./src/pug/**/*.pug', './src/data/**/*.json'], parallel('pug'));

    watch('./src/img/**/*.*', parallel('copy:img'));

    watch('./src/js/**/*.*', parallel('copy:js'));

});

// Запуск сервера
task('server', function () {
    browserSync.init({
        server: {
            baseDir: "./build/"
        }
    })
});

// Очищение папки build перед сборкой
task('clean:build', function() {
    return del('./build')
});

// Дефолтный таск
task(
    'default', 
    series( 
        parallel('clean:build'),
        parallel('scss', 'pug', 'copy:img', 'copy:js'), 
        parallel('server', 'watch'),
    )
);




