var gulp = require('gulp');
var babel = require('gulp-babel');
var del = require('del');
var crisper = require('gulp-crisper');
var gulpif = require('gulp-if');
var lazypipe = require('lazypipe');

var babelTasks = lazypipe()
  .pipe(function() {
    return gulpif('*.js', babel({
      presets: ['es2015']
    }));
  });

gulp.task('clean', function() {
  return del(['dist']);
});

gulp.task('copy', ['clean'], function() {
  return gulp.src([
      'app/index.html',
      'app/bower_components/webcomponentsjs/webcomponents-lite.js',
      'app/elements/x-foo/christmas.png' // copy over element dependencies
    ], {
      // use base to maintain proper relative paths
      // https://github.com/gulpjs/gulp/blob/master/docs/API.md#optionsbase
      base: 'app'
    })
    .pipe(gulp.dest('dist'))
});

gulp.task('crisper', ['clean'], function() {
  return gulp.src('app/elements/**/*.html')
    .pipe(crisper({
      // script in head screws up the ordering because
      // the element's own script comes before polymer
      scriptInHead: false
    }))
    .pipe(babelTasks())
    .pipe(gulp.dest('app/.tmp'));
});

gulp.task('default', ['copy', 'crisper']);
