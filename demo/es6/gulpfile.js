var gulp = require('gulp');
var del = require('del');

gulp.task('clean', function() {
  return del(['app/.tmp', 'dist']);
});

gulp.task('copy', ['clean'], function() {
  return gulp.src([
      'app/index.html',
      'app/bower_components/polymer/**/*',
      'app/bower_components/webcomponentsjs/webcomponents-lite.js',
      'app/elements/x-foo/christmas.png' // copy over element dependencies
    ], {
      // use base to maintain proper relative paths
      // https://github.com/gulpjs/gulp/blob/master/docs/API.md#optionsbase
      base: 'app'
    })
    .pipe(gulp.dest('dist'))
});

gulp.task('default', ['copy']);
