/**
 * This file is part of TeamELF
 *
 * (c) GuessEver <guessever@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const path = require('path');
const gulp = require('gulp');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const streamqueue = require('streamqueue');
const cached = require('gulp-cached');
const remember = require('gulp-remember');

function initialize (options, defaultOutput) {
  options = options || {};
  options.files = options.files || [];
  options.modules = options.modules || [];
  options.output = options.output || defaultOutput
}

function handleError (e) {
  console.log(e.toString());
  this.emit('end');
}

module.exports = function (jsOptions, lessOptions) {
  initialize(jsOptions, './dist/app.js');
  initialize(lessOptions, './dist/app.css');

  gulp.task('default', ['compile-js', 'compile-less']);

  gulp.task('compile-less', function () {
    const stream = streamqueue({objectMode: true});
    return stream.queue(gulp.src(lessOptions.files))
      .queue(
        gulp.src(lessOptions.modules)
          .pipe(cached('less'))
          .pipe(less())
          .pipe(autoprefixer('last 2 versions'))
          .pipe(remember('less'))
      )
      .done()
      .on('error', handleError)
      .pipe(concat(path.basename(lessOptions.output)))
      .pipe(gulp.dest(path.dirname(lessOptions.output)));
  });

  gulp.task('compile-js', function () {
    const stream = streamqueue({objectMode: true});

    stream.queue(gulp.src(jsOptions.files));

    for (var name in jsOptions.modules) {
      var modules = jsOptions.modules[name];
      stream.queue(
        gulp.src(modules)
          .pipe(cached('js'))
          .pipe(babel({
            presets: [
              require('babel-preset-env')
            ],
            plugins: [
              require('babel-plugin-transform-react-jsx'),
              require('babel-plugin-transform-es2015-modules-systemjs')
            ],
            moduleIds: true,
            moduleRoot: name
          }))
          .pipe(remember('js'))
      );
    }
    return stream.done()
      .on('error', handleError)
      .pipe(concat(path.basename(jsOptions.output)))
      .pipe(gulp.dest(path.dirname(jsOptions.output)));
  });

  gulp.task('watch', ['default'], function () {
    gulp.watch(lessOptions.modules, ['compile-less'], function (e) {
      if (e.type === 'deleted') {
        remember.forget('less', e.path);
      }
    });

    for (var name in jsOptions.modules) {
      var modules = jsOptions.modules[name];
      gulp.watch(modules, ['compile-js'], function (e) {
        if (e.type === 'deleted') {
          remember.forget('js', e.path);
        }
      })
    }
  });
};
