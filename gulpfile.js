const gulp = require("gulp");
const concat = require("gulp-concat");
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const imagemin = require("gulp-imagemin");
const browserSync = require("browser-sync").create();
//const sourcemaps   = require("gulp-sourcemaps");
const webpack = require("webpack-stream");

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
    }
}

function html() {
    return gulp.src("./src/**/*.html")
        .pipe(gulp.dest("./build"))
        .pipe(browserSync.stream());
}

function styles() {
    return gulp.src("./src/css/**/*.css")
        .pipe(concat("styles.css"))
        .pipe(autoprefixer({
            browsers: ["> 0.1%"],
            cascade: false
        }))
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(gulp.dest("./build/src/css"))
        .pipe(browserSync.stream());
}

function scripts() {
    return gulp.src("./src/js/index.js")
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest("./build/src/js"))
        .pipe(browserSync.stream());
}

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
        .pipe(gulp.dest("build/src/img"))
}

function watch() {
    browserSync.init({
        server: {
            baseDir: "./build/"
        }
    });

    gulp.watch("./src/css/**/*.css", styles);
    gulp.watch("./*.html", browserSync.reload);
}

function clean() {
    return del(["build/*"]);
}

// Define complex tasks
const build = gulp.series(
    clean,
    gulp.parallel(
        html,
        styles,
        scripts,
        images
    )
);

const dev = gulp.series(
    build,
    watch
);

// Export tasks
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.watch = watch;

exports.build = build;
exports.default = dev