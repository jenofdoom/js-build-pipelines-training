const gulp = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('autoprefixer');
const flexfixes = require('postcss-flexbugs-fixes');
const cssnano = require('cssnano');
const concatjs = require('gulp-concat');
const uglifyjs = require('gulp-uglify');

const PATHS = {
  'src': {
    'root': './src/**',
    'scss': './src/scss/**/*.scss',
    'js': './src/js/**/*.js'
  },
  'dist': {
    'root': './dist/',
    'css': './dist/css/',
    'js': './dist/js/'
  }
}

gulp.task('copy-files', () => {   
  return gulp.src([PATHS.src.root, '!' + PATHS.src.scss, '!' + PATHS.src.js])
    .pipe(gulp.dest(PATHS.dist.root)); 
});

gulp.task('scss', () => {
  return gulp.src(PATHS.src.scss)
    .pipe(sass({
        includePaths: [
          './node_modules/bootstrap/scss/'
        ]
      })
      .on('error', sass.logError)
    )
    .pipe(sourcemaps.init())
    .pipe(postcss([
      autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false,
        remove: false
      }),
      flexfixes(),
      cssnano()
    ]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(PATHS.dist.css));
});

gulp.task('js', function() {
  return gulp.src([
      './node_modules/jquery/dist/jquery.js',
      PATHS.src.js
    ])
    .pipe(sourcemaps.init())
    .pipe(concatjs('bundle.js'))
    .pipe(uglifyjs({ mangle: false }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(PATHS.dist.js));
});

gulp.task('build', ['copy-files', 'scss', 'js']);

gulp.task('watch', () => {
  gulp.watch(PATHS.src.root, ['build']);
});

gulp.task('default', ['build', 'watch']);