/// <binding AfterBuild='js, bower' />
var gulp = require('gulp');
var browserify = require('browserify'); // Bundles JS
var babelify = require('babelify');  // Transforms React JSX to JS
var source = require('vinyl-source-stream'); // Use conventional text streams with Gulp
var concat = require('gulp-concat'); //Concatenates files
var eslint = require('gulp-eslint'); //Lint JS files, including JSX
var rename = require('gulp-rename');
var es = require('event-stream');
var glob = require('glob');
var bower = require('gulp-bower');

var config = {
    paths: {
        port: 5000,
        bowerDir: './bower_components',
        js: './src/**/*.js',
        devBaseUrl: 'http://localhost',
        html: './src/*.html',
        css: [
            'css/site.css'
        ],
        images: './images/*',
        dist: './wwwroot'
    }
}



gulp.task('css', function () {
    gulp.src(config.paths.css)
        .pipe(concat('bundle.css'))
        .pipe(gulp.dest(config.paths.dist + '/css'));
});

gulp.task('watch', function () {
    return gulp.watch([config.paths.js, config.paths.css], ['js', 'css', 'lint']);
});

gulp.task('lint', function () {
    return gulp.src(config.paths.js)
        .pipe(eslint({ config: 'eslint.config.json' }))
        .pipe(eslint.format());
});

gulp.task('images', function () {
    return gulp.src(config.paths.images)
        .pipe(gulp.dest(config.paths.dist + '/images'));
});

gulp.task('js', function () {

    glob(config.paths.js, function (er, files) {
        // files is an array of filenames. 
        // If the `nonull` option is set, and nothing 
        // was found, then files is ["**/*.js"] 
        // er is an error object or null. 
        //var files = config.paths.mainJsFiles;
        // map them to our stream function
        var tasks = files.map(function (entry) {
            return browserify({ entries: [entry] })
                .transform(babelify)
                .transform(require('browserify-css'))
                .bundle()
                .on('error', console.error.bind(console))
                .pipe(source(entry))
                // rename them to have "bundle as postfix"
                .pipe(rename({
                    extname: '.bundle.js'
                }))
                .pipe(gulp.dest(config.paths.dist + '/scripts'));
        });
        // create a merged stream
        return es.merge.apply(null, tasks);
    })


});

gulp.task('bower', function () {     return bower()         .pipe(gulp.dest(config.paths.bowerDir)) });

gulp.task('build', ['css', 'js'], function () {
    // to do, write code to start the webserver using dotnet watch etc
});