# General overview

Why do we build?

* Only send the client the bits they need
* Develop in a more powerful syntax
* Keep 3rd party libraries out of your source tree
* Apply transformations like minification

## Dependency management

### npm

* [package.json](https://docs.npmjs.com/files/package.json) & [npm init](https://docs.npmjs.com/cli/init)
* [devDependencies](http://stackoverflow.com/a/22004559/160648)
* [src and dist](http://stackoverflow.com/a/23731040/160648)
* [version control](https://giphy.com/gifs/git-merge-cFkiFMDg3iFoI/fullscreen) & [.gitignore](https://github.com/jenofdoom/js-build-pipelines-training/blob/master/webpack-example/.gitignore)
* [package versioning strategies](https://docs.npmjs.com/misc/semver)
* [npm-check-updates](https://www.npmjs.com/package/npm-check-updates)
* [npm shrinkwrap](https://docs.npmjs.com/cli/shrinkwrap)

Note there is an up-and-coming new dep mananagment layer on top of npm/replacing
npm coming - [yarn](https://yarnpkg.com/en/).

## Security

It's good to both get advised on when particular of your packages have security
issues, and also to keep up to date with the latest versions of your
dependencies (although you'll need to manually vet if an upgrade has breaking
changes to your application, usually by looking at their release log - hopefully
you have automated tests to help detect regressions). We can add some tooling to
assist us manage our project dependencies.

In the scripts object in `package.json`:

```
"deps:check": "npx npm-check-updates",
"deps:update": "npx npm-check-updates -- -u && npx npm-check-updates -- -a && npm install"
```

`npm run deps:check` will inform you if particular of your packages are now out
of date.

`npm run deps:update` will automatically update your `package.json` file to the
latest versions (you want to be more judicious about running this command,
particularly for established projects), install those updates.

npm has a built in security checker that will warn you whenever you run `npm
install` if you have outstanding security vulnerabilities.

## Integrating with other build pipelines

Your frontend build pipeline should limit itself to just the frontend build. If
your project has a deployment story, you just need to kick off the f/e build as
part of that process (e.g. ansible or fabric etc. would run `npm install` and
`npm build`). It is also totally possible to pass in project-level configuration
via command line arguments to your build process using a npm module like
[yargs](https://www.npmjs.com/package/yargs).

## Figuring out what kind of build pipeline is appropriate

* How complex is your project?
* Is there existing tooling?
* Do you want to use ES6/ES2015?

Two choices we will explore today:

__Gulp__ for simple `.scss` and jQuery projects.

__Webpack__ for more complex projects using JS modules and ES6.

## Getting started

If you have your own github account already, you might prefer to fork this
repository and clone that instead. If you don't just run the following commands
on a terminal or command line interface (assuming that your machine already has
[git available](https://git-scm.com/downloads)):

```
git clone https://github.com/jenofdoom/js-build-pipelines-training.git
cd js-build-pipelines-training
```

### Install node, npm and project dependencies

First, we need to install [node.js](https://nodejs.org/) and its package
manager, npm.

[Ubuntu/Debian/Mint instructions](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)

[Mac instructions](http://blog.teamtreehouse.com/install-node-js-npm-mac)

[Windows instructions](http://blog.teamtreehouse.com/install-node-js-npm-windows)

### Code editor

If you have a favourite code editor feel free to use that, but I recommend
[Atom](https://atom.io/).

In Atom, right click in the left panel, select `Add Project Folder` and open the
`js-build-pipelines-training` folder.

# Gulp

In our example project folder `gulp-tutorial`, we want to install a dependency
into our project manifest (if you were beginning from scratch and didn't have an
existing `package.json` file you'd start by running `npm init` and answering the
prompts). From a terminal, in the `gulp-tutorial` folder:

```
npm install --save-dev gulp
```

## Copying project files from `src` to `dist`

To start, for all files other than our JS and SCSS files (which we need to
perform special extra steps on) we just want to directly copy over with no
transformations. It would be easy to extend this later and break out particular
file types to have special tasks associated (for example, to compress `.png`
files).

Create a file in the root of the `gulp-tutorial` folder called `gulpfile.js`.
This will contain all our build pipeline configuration. Open that file in an
editor and add the following:

```
const gulp = require('gulp');

gulp.task('copy-files', () => {   
  return gulp.src('./src/**')
    .pipe(gulp.dest('./dist/'));
});

gulp.task('build', ['copy-files']);
```

In `package.json`, modify the scripts to include a new command:

```
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1",
  "build": "./node_modules/.bin/gulp build"
},
```

In a terminal from the `gulp-tutorial` folder you should now be able to run:

```
npm run build
```

All the src files should have been copied over to the the dist folder. Open a
file browser and locate the `dist/index.html` file, right click on it and open
it in a web browser. Everything will be pretty broken right now until we get
SCSS compilation working,and integrate some JS dependencies.

### Define all the paths separately

This will make the configuration more centralised and prevent repetition later.

```
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
  return gulp.src(PATHS.src.root)
    .pipe(gulp.dest(PATHS.dist.root));
});
```

### Exclude the files in the JS and SCSS folders

```
gulp.task('copy-files', () => {   
  return gulp.src([PATHS.src.root, '!' + PATHS.src.scss, '!' + PATHS.src.js])
    .pipe(gulp.dest(PATHS.dist.root));
});

```

> This will write out empty folders as it's excluding the contents of the
folders not the folders themselves, but this doesn't matter a huge amount and
we'd need separate entries in the PATHS object to sort it out, without the `/\**`
suffix.

## SCSS compilation

```
npm install --save-dev gulp-sass
```

```
const sass = require('gulp-sass');
```

```
gulp.task('scss', () => {
  return gulp.src(PATHS.src.scss)
    .pipe(sass()
      .on('error', sass.logError)
    )
    .pipe(gulp.dest(PATHS.dist.css));
});

gulp.task('build', ['copy-files', 'scss']);
```

### sourcemaps, autoprefixer, postcss-flexbugs-fixes and minification

```
npm install --save-dev gulp-postcss gulp-sourcemaps autoprefixer postcss-flexbugs-fixes cssnano
```

```
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('autoprefixer');
const flexfixes = require('postcss-flexbugs-fixes');
const cssnano = require('cssnano');
```

```
gulp.task('scss', () => {
  return gulp.src(PATHS.src.scss)
    .pipe(sass()
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
```

## JavaScript concatenation and minification

We are going to use [gulp-concat](https://www.npmjs.com/package/gulp-concat) to
squish together all our JS files, and
[gulp-uglify](https://www.npmjs.com/package/gulp-uglify) for minification.

```
npm install --save-dev gulp-concat gulp-uglify
```

```
const concatjs = require('gulp-concat');
const uglifyjs = require('gulp-uglify');
```

```
gulp.task('js', () => {
  return gulp.src(PATHS.src.js)
    .pipe(sourcemaps.init())
    .pipe(concatjs('bundle.js'))
    .pipe(uglifyjs({ mangle: false }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(PATHS.dist.js));
});

gulp.task('build', ['copy-files', 'scss', 'js']);
```

This gets all our own JS sorted, but our project has a dependency of jQuery, so
we'll need to pull that in too.

```
npm install --save-dev jquery
```

We need to modify the `gulp.src` statement to take an array of locations rather
than just our local JS folder (note we get the unminified version as we minify
ourselves):

```
return gulp.src([
    './node_modules/jquery/dist/jquery.js',
    PATHS.src.js
  ])
```

## Adding a watch process

At the bottom of the gulpfile:

```
gulp.task('watch', () => {
  gulp.watch(PATHS.src.root, ['build']);
});

gulp.task('default', ['build', 'watch']);
```

In the `package.json` scripts:

```
"start": "./node_modules/.bin/gulp"
```

In a terminal:

```
npm start
```

You can leave that running and as you save changes within the `src` folder, the
project will rebuild.

## Adding Bootstrap

### Integrating Bootstrap

_(Obviously, if you didn't want to integrate Bootstrap you'd not do this bit!)_

We can use `gulp-sass` to import the SCSS root file for Bootstrap.

Install Bootstrap (check the [downloads
page](https://getbootstrap.com/docs/4.0/getting-started/download/#npm) to check
you're getting the most up to date version):

```
npm install bootstrap
```

In your gulpfile's scss task, alter the sass() function with a new config
object:

```
.pipe(sass({
    includePaths: [
      './node_modules/bootstrap/scss/'
    ]
  })
  .on('error', sass.logError)
)
```

In your `main.scss` file, add:

```
@import 'bootstrap';
```

> If we wanted to use Bootstrap's JS file, you'd import it into the `js` task in
the same way that we did for the jQuery dep.

#### Customising Bootstrap's variables

Refer to `node_modules/bootstrap/scss/_variables.scss` to see what variables can
be customised. Make a new file in your `src/scss/` folder,
`_custom-boostrap.scss`, and add in your variables there. Then set up your
`main.scss` file to import the variables file: it must be imported _before_ the
main bootstrap file (due to the way that the _!default_ declaration works):

```
@import 'custom-bootstrap';
@import 'bootstrap';
```

We can add a rule to make background colour something other than white in
`_custom-bootstrap.scss`:

```
$body-bg: #cef1ff;
```

# Webpack

Usually, you'll be starting from an example Webpack configuration rather than
building all of this out from scratch, but my aim here is to teach you from
scratch so you'll know what all of the parts of the config file are doing in
case you need to tweak them.

Note that we're using version 4 of Webpack ([docs
here](https://webpack.js.org/concepts/)) - if you're later looking up tutorials
etc. make sure you're looking at the right  version, the syntax differs.

In our example project folder `webpack-tutorial`, first run `npm install` by
itself to get the already-specified project dependencies. Then:

```
npm install --save-dev webpack webpack-cli
```

> (From this point on, assume any `npm install` instructions should be carried
out in a terminal from inside the
`~/js-build-pipelines-training/webpack-tutorial` folder)

## Basic empty config file

Make a file (at the same level as the `package.json` file) called
`webpack.config.js` with the following contents:

```
const config = {

};

module.exports = config;
```

## Defining the entry and output

Inside the `config` object (from this point on everything we add, unless
otherwise specified, goes into the config object) in `webpack.config.js`:

```
entry: './src/index.jsx',
```

At the top of the file:

```
const path = require('path');
```

In `webpack.config.js`:

```
output: {
  path: path.resolve(__dirname, 'dist'),
  filename: 'bundle.js'
},
```

## Better path resolution

```
resolve: {
  extensions: ['.js', '.jsx', '.json', '.css', '.scss'],
  modules: [path.resolve(__dirname, 'src'), 'node_modules']
}
```

> We use a absolute path so only this folder called `src` will be searched, not
any ancestor folders that are called `src`.

## Transforming our project files with loaders

Natively, Webpack only understands JavaScript, but if we want to get to a point
where we can delegate all of our bundling to Webpack we should utilise some
_loaders_ in order to be able to also process:

* es6 aka es2015
* jsx (if we're using React)
* images and other files
* css/scss/less

### JS transpilation

We use [Babel](http://babeljs.io/) to transpile our modern JS (es6) to JS that
is supported across all browsers.

`npm install --save-dev babel-loader @babel/core @babel/preset-env @babel/preset-react`

Note that you only need `@babel/preset-react` for React projects.

```
module: {
  rules: [
    {
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }
  ]
}
```

We need to provide some configuration for our Babel loader - this could go in
the webpack config but it's more typical to create a dedicated configuration
file. This is also where we can specify (if we're using React) that we want to
convert jsx to js too. Create a file called `.babelrc` at the project root:

```
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "forceAllTransforms": true,
        "modules": false
      }
    ],
    "@babel/preset-react"
  ]
}
```

Obviously you'd only include `react` for a React project.

The `env` preset has configuration setting to disable Babel's module imports,
because Webpack 2 takes care of those for us.

If you need to support older browsers you might want to configure which browsers
`env` targets, see the [docs for
env](http://babeljs.io/docs/plugins/preset-env/).

You could also add additional presets, like the
[stage-x](http://babeljs.io/docs/plugins/#presets-stage-x-experimental-presets-)
presets for upcoming JavaScript features.

## Add a build command in package.json

In `package.json`:

```
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1",
  "build": "./node_modules/.bin/webpack -p"
},
```

In your terminal:

```
npm run build
```

## HTML index

It doesn't matter if our file compiles OK if we don't have a HTML page to load
it from. We could just hand write a file and manually add a script tag to our
bundle, but it's usually better to use a Webpack plugin called
[HtmlWebpackPlugin](https://github.com/jantimon/html-webpack-plugin) to take
care of this for us, as it has some nice extra functionality. We already have a
simple `src/index.html` file that we can use.

`npm install --save-dev html-webpack-plugin`

In `webpack.config.js`:

```
plugins: [
  new HtmlWebpackPlugin({
    template: './src/index.html',
    hash: true
  })
],
```

Because this is a plugin, we need to include it at the top of the file:

```
const HtmlWebpackPlugin = require('html-webpack-plugin');
```

## Development server

We can use
[webpack-dev-server](https://webpack.github.io/docs/webpack-dev-server.html) to
provide a development webserver for us.

```
npm install --save-dev webpack-dev-server
```

In `package.json`:

```
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1",
  "build": "./node_modules/.bin/webpack -p",
  "start": "./node_modules/.bin/webpack-dev-server"
},
```

In `webpack.config.js` we should make sure that our dev server supports HTML5
push state:

```
devServer: {
  historyApiFallback: true
},
```

Now in a terminal we can leave the dev server running, and it will automatically
rebuild when it sees changes are saved to the project.

```
npm start
```

> The development server runs on a port on localhost (8080 by default, but you
can configure what the port number is). If you need to be developing against a
backend API that's normally supposed to be on the same domain, which doesn't
have `Access-Control-Allow-Origin` set, you're going to run into issues with
CORS. You can look at setting up a reverse proxy with nginx or Apache to
sidestep this, but this will prevent the hot reload from working. Read more
about [SOP problems
here](https://jvaneyck.wordpress.com/2014/01/07/cross-domain-requests-in-javascript/)
(and avoid going down the jsonp route for a solution).

## More loaders

### Polyfills

Some modern JavaScript we might want to use (beyond just ES6 syntax) is not
supported in IE and some other browsers. For example, the new specification for
AJAX requests that supersedes XHR, fetch, needs a polyfill for most browsers.

When we have a polyfill we want our code to include, we can normally npm install
it and the include it in our Webpack build by adding an extra entry point to our
app, so for example `entry: './src/index.jsx'` might become `entry:
['whatwg-fetch', './src/index.jsx'],` where
[whatwg-fetch](https://github.com/github/fetch) is the name of the fetch
polyfill package.

For more general polyfills, look at
[@babel/polyfill]https://www.npmjs.com/package/@babel/polyfill) which pulls in
[core-js](https://github.com/zloirock/core-js). Right now our project uses
`Object.values()` in the search functionality, which is not yet supported in
older browsers - we can fix this:

```
npm install --save-dev @babel/polyfill
```

In `webpack.config.js`, change the entry point to an array:

```
entry: ['@babel/polyfill', './src/index.jsx'],
```

### Images and other files

Any images that are referenced from within our JSX, or (later on) files that get
imported through our CSS (for example, webfont files) will also be pulled into
the build by Webpack. We need to tell Webpack how to deal with these files, by
using the [url-loader](https://github.com/webpack-contrib/url-loader):

```
npm install --save-dev url-loader file-loader
```

In `webpack.config.js`, in the module rules, underneath our JSX rule:

```
{
  test: /\.(png|svg|jpg|gif|woff|woff2|eot|ttf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
  exclude: /node_modules/,
  loader: 'url-loader?limit=10000'
}
```

_url-loader_ will insert a data URI rather than a separate file if the filesize
is less than 10kb (as we're configured it) otherwise it automatically uses
_file-loader_ to write the file out as a separate asset.

If we want to include images or other files, we should store them somewhere on
our `src` tree. In the example project I've already created a `src/assets/img`
folder and put a couple of images in it ([photo
credit](https://www.flickr.com/photos/volvob12b/13638621465/), [pattern
credit](https://www.toptal.com/designers/subtlepatterns/crossword/)).

We can now use the photo image in our JSX as an image tag (just add it at the
bottom of `src/components/about/about.jsx`):

```
<img src={photo} />
```

and at the top of the file uncomment:

```
import photo from 'assets/img/banks-peninsula.jpg';
```

> Optional: some files might need directly copying over to your dist folder
because they aren't imported from your normal source tree (e.g. a `robots.txt`
file). Look at
[CopyWebpackPlugin](https://github.com/kevlened/copy-webpack-plugin) for this
functionality.

> Optional: if you want to set up favicons for your site you can either directly
copy them over using CopyWebpackPlugin, or you can use a favicon plugin,
[FaviconsWebpackPlugin](https://github.com/jantimon/favicons-webpack-plugin)

###  CSS

To get just CSS working all we need to do is:

```
npm install --save-dev style-loader css-loader
```

And in the module rules in `webpack.config.js`, below the `jsx` test:

```
{
  test: /\.css$/,
  exclude: /node_modules/,
  use: ['style-loader', 'css-loader']
},
```

Now we can include our CSS file from the project index (we could include
multiple css files, if we had them). In `index.jsx`, uncomment the `// import
'styles.css';` line.

File paths in the CSS (for background images) will use the same `url-loader`
process as images, although note that they are relative to the entry point (if
you want to do imports relative to the `.scss` file, look at
[resolve-url-loader](https://github.com/bholloway/resolve-url-loader)). So we
can now add a background image in the styling for the body tag in

```
background: url(assets/img/crossword.png);
```

### SCSS

First we need to delete the reference to our `styles.css` file that we don't
need any more, so we can swap to the `.scss` files I've already preprepared in
the example. In `index.jsx`, uncomment the `// import 'index.scss';` line and
delete the `import 'styles.css';` line.

We also need to uncomment the `.scss` imports in several other files:

* `src/components/row/row.jsx`
* `src/components/search/search.jsx`
* `src/components/table/table.jsx`

#### sass-loader

We use the [sass-loader](https://github.com/webpack-contrib/sass-loader) to
transform our `.scss` files:

```
npm install --save-dev sass-loader node-sass
```

In the module rules in `webpack.config.js`, alter the `css` test:

```
test: /\.scss$/,
exclude: /node_modules/,
use: [
  'style-loader',
  'css-loader',
  {
    loader: 'sass-loader',
    options: {
      sassOptions: {
        includePaths: [path.resolve(__dirname, 'src')]
      }
    }
  }
]
```

The _includePaths_ option means that we can split our files up, so we can both
take advantage of normal SCSS imports, and also do direct imports of `.scss`
files.

#### postcss-loader

As well as regular SCSS it's good to post-process our CSS to use an
[autoprefixer](https://github.com/postcss/autoprefixer) (and in this instance
we're also going to use
[postcss-flexbugs-fixes](https://github.com/luisrudge/postcss-flexbugs-fixes)
because Bootstrap requires it).

```
npm install --save-dev postcss-loader autoprefixer postcss-flexbugs-fixes
```

At the top of the configuration file:

```
const autoprefixer = require('autoprefixer');
const flexfixes = require('postcss-flexbugs-fixes');
```

Inside the `use` object in the `scss` test, after `css-loader` and before
`sass-loader`:

```
{
  loader: 'postcss-loader',
  options: {
    plugins: [
      autoprefixer(),
      flexfixes()
    ]
  }
},
```

In `package.json`, add:

```
"browserslist": [
  "last 2 versions"
],
```

#### Integrating Bootstrap

_(Obviously, if you didn't want to integrate Bootstrap you'd not do this bit!)_

We can use `sass-loader` to import the SCSS root file for Bootstrap.

Install Bootstrap (check the [downloads
page](https://getbootstrap.com/docs/4.0/getting-started/download/#npm) to check
you're getting the most up to date version):

```
npm install --save-dev bootstrap@4.0.0-beta
```

In your main `.scss` file, uncomment:

```
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/bootstrap";
```

The tilde tells the importer not to use a relative path, so it will then resolve
from the `node_modules` folder.

##### Customising Bootstrap's variables

Refer to `node_modules/bootstrap/scss/_variables.scss` to see what variables can
be customised. We can use the already set up
`src/base-styles/_custom-boostrap.scss`, and add in your variables there. Then
set up your `base-styles/_variables.scss` file to import the default Bootstrap
variables file (just uncomment the exisiting line):

```
@import "~bootstrap/scss/variables";  // bootstrap variables
```

We can add a rule to make our primary colour green not blue in our
`src/base-styles/_custom-bootstrap.scss`:

```
$brand-primary: #48a843;
```

## Linting with ESLint

Because of its good support of ES2015 and React, we will use
[ESLint](http://eslint.org) for our code linting. We can build the linter into
our build process so we'll see any problems in the compile process immediately.

```
npm install eslint --save-dev
```

ESLint has a configuration tool we can use to get set up quickly:

```
./node_modules/.bin/eslint --init
```

I'd suggest giving the following answers (for this project, for your own you can
set up as you please):

1. How would you like to configure ESLint? Answer questions about your style
2. Are you using ECMAScript 6 features? Yes
3. Are you using ES6 modules? Yes
4. Where will your code run? Browser
5. Do you use CommonJS? No
6. Do you use JSX? Yes
7. Do you use React? Yes
8. What style of indentation do you use? Spaces
9. What quotes do you use for strings? Single
10. What line endings do you use? Unix
11. Do you require semicolons? Yes
12. What format do you want your config file to be in? JSON

This will create an `.eslint.json` file for you - open it in a code editor and
change the indent to `2` on line 20 to match our current project. We also want
to change line 6 from `"extends": "eslint:recommended",` to:

```
"extends": [
    "eslint:recommended",
    "plugin:react/recommended"
],
```

We might also need to add some extra settings for the react plugin:

```
"settings": {
    "react": {
        "version": "detect"
    }
}
```

> Optional: there are a bunch of other configurations you can make, for example
I prefer the `"no-console"` check to "warn" rather than "error". See the [rules
list](http://eslint.org/docs/rules/) for more information.

Now we can add the linter to our build process. First, install the ESlint loader:

```
npm install --save-dev eslint-loader
```

In the module rules in the config object in `webpack.config.js`, at the top
before the `babel-loader`:

```
{
  enforce: 'pre',
  test: /\.(js|jsx)$/,
  exclude: /node_modules/,
  loader: 'eslint-loader',
},
```

## Production build

Webpack has a shortcut for the most common needed configuration for [production
builds](https://webpack.js.org/guides/production-build/), by adding `-p` to the
command line. We can add this now to our build command in `package.json`:

`"build": "./node_modules/.bin/webpack -p",`

We should also make sure we don't end up with any cruft in our build folder, so
it's a good idea to always delete the old build before creating a new one:

`"build": "rm -rf ./dist && ./node_modules/.bin/webpack -p",`

You should see that after applying the prod flag, the `bundle.js` file is
substantially smaller in size  (from about 1.49 MB to 375 kB)!

### Source maps

It's good to have source maps enabled in production, for debugging and
performance profiling. Webpack has [many different
schema](https://webpack.js.org/configuration/devtool/) for generating source
maps, some of which are better for dev than prod.

I recommend `source-map` for production and
`cheap-module-eval-source-map` for development (based on [this
advice](http://cheng.logdown.com/posts/2016/03/25/679045) and some testing).

There is a variable available at run time that contains the name of the npm
script (as defined in `package.json`) that invoked webpack, called
`process.env.npm_lifecycle_event`. So we can base our decision about what source
maps schema to use on the value of that variable - if it's "build" then we
should use the `cheap-module-source-map` schema. The config key we need to
change is the rather misleadingly-named `devtool`.

In `webpack.config.js`, in the config object:

```
devtool: process.env.npm_lifecycle_event === 'build' ? 'cheap-module-source-map'
: 'cheap-module-eval-source-map',
```

> The above should all be on one line

`.map` files should now be output by the build.

> Optional: rather than this crude method of having production specific
configuration, we could have a common config which can be extended for different
environments using [webpackMerge](https://github.com/survivejs/webpack-merge).
Or you can just have two config files, but this leads to a lot of duplication so
I don't recommend it.

### Separate CSS assets to avoid FOUC

In order to avoid flash of unstyled content, we should use the
[mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)
to split all the compiled CSS out into a proper old-fashioned CSS file. It's
fine for this to be in place for our development builds too.

```
npm install --save-dev mini-css-extract-plugin
```

At the top of `webpack.config.js`:

```
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
```

In the plugins array:

```
new MiniCssExtractPlugin({
  filename: 'bundle.css'
})
```

In our module rules, we need to replace the exisiting `.scss` test with one that
is wrapped with ExtractTextPlugin. So our exisiting rule:

```
{
  test: /\.scss$/,
  use: [
    'style-loader',
    'css-loader',
    {
      loader: 'postcss-loader',
      options: {
        plugins: [
          autoprefixer({browsers: ['last 2 versions']}),
          flexfixes()
        ]
      }
    },
    {
      loader: 'sass-loader',
      options: {
        sassOptions: {
          includePaths: [path.resolve(__dirname, 'src')]
        }
      }
    }
  ]
},
```

becomes:

```
{
  test: /\.scss$/,
  use: [
    MiniCssExtractPlugin.loader,
    'css-loader',
    {
      loader: 'postcss-loader',
      options: {
          plugins: [
            autoprefixer({browsers: ['last 2 versions']}),
            flexfixes()
          ]
      }
    },
    {
      loader: 'sass-loader',
      options: {
        sassOptions: {
            includePaths: [path.resolve(__dirname, 'src')]
          }
        }
     }
  ]
},
```

You should now get a separate CSS file written. The downside of the plugin is
that although the bundle still recompiles automatically (when using the dev
server), the webpage will no longer refresh automatically on style changes. For
the reason you might want to consider reserving ExtractTextPlugin for your
production builds only.
