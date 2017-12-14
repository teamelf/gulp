# teamelf-gulp
packaged gulp for teamelf

## Installation
use `npm install --save teamelf-gulp`

## Usage
in your `gulpfile.js`
```js
const gulp = require('teamelf-gulp');

gulp({
  files: [
    // put some lib (like jquery) here
  ],
  modules: {
    'teamelf': ['js/**/*.js'] // register modules using systemjs
  },
  output: './dist/extension.js'
}, {
  modules: ['less/main.less'],
  output: './dist/app.css'
});
```

Then run `gulp` or `gulp watch`

## License
MIT
