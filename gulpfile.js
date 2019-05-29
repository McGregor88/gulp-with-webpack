"use strict";

// Load plugins
const gulp = require("gulp");
const pug = require("gulp-pug");
const plumber = require("gulp-plumber");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const csscomb = require('gulp-csscomb');
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');
const svgSprite = require('gulp-svg-sprite');
const imagemin = require("gulp-imagemin");
const browserSync = require("browser-sync").create();
const sourcemaps = require("gulp-sourcemaps");
const webpack = require("webpack-stream");
const gulpif = require("gulp-if");
const errorHandler = require("./util/handle-errors.js");
const notify = require("gulp-notify");

let isDev = false;
let isProd = !isDev;

// Webpack config
const webpackConfig = {
    output: {
        filename: "scripts.js"
    },
    module: {
        rules: [{
            test: /\.js$/,
            loader: "babel-loader",
            exclude: "/node_modules/"
        }]
    },
    mode: isDev ? "development" : "production",
    devtool: isDev ? "eval-source-map" : "none"
}

// Task to Build HTML
function html() {
    return gulp.src("./src/templates/pages/*.pug")
        .pipe(plumber({
            errorHandler: errorHandler
        }))
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest("./build/"))
        .pipe(browserSync.stream());
}

// Task to fonts
function fonts() {
    return gulp.src("./src/fonts/**/*.{ttf,woff,eof,svg}")
        .pipe(gulp.dest("./build/src/fonts"));
}

// Task to Compile Sass
function styles() {
    return gulp.src("./src/sass/style.sass")
        .pipe(sass({
            outputStyle: "expanded"
        }).on("error", notify.onError()))
        .pipe(autoprefixer({
            browsers: ["> 0.1%"],
            cascade: false
        }))
        .pipe(gulpif(isDev, csscomb()))
        .pipe(gulpif(isProd, cleanCSS({
            level: 2
        })))
        .pipe(gulp.dest("./build/src/css"))
        .pipe(browserSync.stream());
}

// Task to scripts
function scripts() {
    return gulp.src("./src/js/index.js")
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest("./build/src/js"))
        .pipe(browserSync.stream());
}

// Task to SVG sprite
function svg() {
    return gulp.src('./src/img/svg/*.svg')
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: {
                xmlMode: true
            }
        }))
        .pipe(replace('&gt;', '>'))
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: "sprite.svg"
                }
            }
        }))
        .pipe(gulp.dest('./build/src/img/svg/'));
}

// Task to Optimize Images
function images() {
    return gulp.src("./src/img/**/*")
        .pipe(imagemin([
            imagemin.gifsicle({
                interlaced: true
            }),
            imagemin.jpegtran({
                progressive: true
            }),
            imagemin.optipng({
                optimizationLevel: 5
            }),
            imagemin.svgo({
                plugins: [{
                        removeViewBox: true
                    },
                    {
                        cleanupIDs: false
                    }
                ]
            })
        ]))
        .pipe(gulp.dest("./build/src/img"))
}

// Task to Optimize Images (uploads folder)
function uploads() {
    return gulp.src(['src/uploads/**/*'], {
            base: 'src'
        })
        .pipe(imagemin([
            imagemin.gifsicle({
                interlaced: true
            }),
            imagemin.jpegtran({
                progressive: true
            }),
            imagemin.optipng({
                optimizationLevel: 5
            }),
            imagemin.svgo({
                plugins: [{
                        removeViewBox: true
                    },
                    {
                        cleanupIDs: false
                    }
                ]
            })
        ]))
        .pipe(gulp.dest('build'));
}

// Task to Watch Templates Changes and Styles
function watch() {
    browserSync.init({
        server: {
            baseDir: "./build/"
        }
    });

    gulp.watch("./src/sass/**/*.s+(ass|css)", gulp.parallel(styles));
    gulp.watch("./src/templates/**/*.pug", gulp.parallel(html));
}

// Task to Clean
function clean() {
    return del(["build/*"]);
}

// Define complex tasks
const build = gulp.series(
    clean,
    gulp.parallel(
        html,
        fonts,
        styles,
        scripts,
        svg,
        images,
        uploads
    )
);

const dev = gulp.series(
    build,
    watch
);

// Export tasks
exports.html = html;
exports.fonts = fonts;
exports.styles = styles;
exports.scripts = scripts;
exports.svg = svg;
exports.images = images;
exports.watch = watch;

exports.build = build;
exports.default = dev