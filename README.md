# Webpack

Note that we're using version 2 of Webpack ([docs
here](https://webpack.js.org/concepts/)), not version 1 - if you're later
looking up tutorials etc make sure you're looking at the right version, the
syntax differs.

`npm install --save-dev webpack`

## Defining the entry and output

Inside the `config` object in `webpack.config.js`:

```
entry: './src/index.jsx',
```

At the top of the file: 

```
const path = require('path');
```

Inside the `config` object in `webpack.config.js`:

```
output: {
  path: path.resolve(__dirname, 'dist'),
  filename: 'bundle.js'
},
```

## Transforming our project files with loaders

Natively, Webpack only understands JavaScript, but if we want to get to a point
where we can delegate all of our bundling to Webpack we should utilise some
_loaders_ in order to be able to also process:

* es6
* jsx
* css/scss/less
* images and other files

## Add a build command in package.json

In `package.json`:

```
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1",
  "build": "./node_modules/.bin/webpack"
},
```

`npm run build`

## Development server

`npm install --save-dev webpack-dev-server`

In `package.json`:

```
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1",
  "start": "./node_modules/.bin/webpack-dev-server --hot --inline",
  "build": "./node_modules/.bin/webpack"
},
```

In `webpack.config.js`:

```
devServer: {
  historyApiFallback: true
},
```

`npm start`


## Polyfills

whatwg-fetch

other es6 stuff

##  CSS

styles-loader and css-loader

## Files

`/assets` folder

image credit: https://www.flickr.com/photos/volvob12b/13638621465/

import photo from 'assets/img/banks-peninsula.jpg';

<img src={photo} />

favicons???

## SCSS

### sass-loader

### postcss-loader


`npm install --save-dev postcss-loader autoprefixer postcss-flexbugs-fixes`

at the top of the file:
```
const autoprefixer = require('autoprefixer');
const flexfixes = require('postcss-flexbugs-fixes');
```

after `css-loader` and before `sass-loader`:
```
{
  loader: 'postcss-loader',
  options: {
    plugins: [
      autoprefixer({browsers: ['last 2 versions']}),
      flexfixes()
    ]
  }
},
```

### Integrating Bootstrap

_(Obviously, if you didn't want to integrate Bootstrap you'd not do this bit!)_

We can use `sass-loader` to import the SCSS root file for Bootstrap.

Install Bootstrap (check the [downloads
page](https://v4-alpha.getbootstrap.com/getting-started/download/#npm) to check
you're getting the most up to date version):

```
npm install --save-dev bootstrap@4.0.0-alpha.6
```

In your main `.scss` file, add:

```
@import "~bootstrap/scss/bootstrap";
```

The tilde tells the importer not to use a relative path, so it will then resolve
from the `node_modules` folder.

#### Customising Bootstrap's variables

Refer to `node_modules/bootstrap/scss/_variables.scss` to see what variables can
be customised. Make a new file in your `src/base-styles/` folder,
`_custom-boostrap.scss`, and add in your variables there. Then set up your main
`.scss` file to import the variables file: it must be imported _before_ the main
bootstrap file (due to the way that the _!default_ declaration works):

```
@import "base-styles/custom-bootstrap";
@import "~bootstrap/scss/bootstrap";
```

## Linting with ESLint

## Source maps

## Production build

ExtractTextPlugin
https://webpack.js.org/plugins/extract-text-webpack-plugin/#extracting-sass-or-less

https://webpack.js.org/loaders/sass-loader/#extracting-style-sheets

node env var

-p
