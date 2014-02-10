# Illusionist

[![Build Status](https://travis-ci.org/mirego/illusionist.png?branch=master)](https://travis-ci.org/mirego/illusionist)

[![Code Climate](https://codeclimate.com/github/mirego/illusionist.png)](https://codeclimate.com/github/mirego/illusionist)

`Illusionist` will make you believe ES6 is already available in browsers

## Installation

```bash
$ npm install -g illusionist
```

## Command-line

```
Usage: illusionist [options] [< in [> out]]
                   [file|dir ...]

  Options:

    -h, --help         Display help information
    -m, --module-name  Module name for stdin
    -M, --module-type  Module type [default: amd] (Options: amd, cjs, globals)
    -o, --out <dir>    Output to <dir> when passing files
    -v, --version      Display the version of Illusionist
    -w, --watch        Watch file(s) for changes and re-compile
```

### STDIO Transpilation Example

`Illusionist` reads from *stdin* and outputs to *stdout*:

```bash
$ illusionist < es6-file.js > es5-file.js
```

You can also test transpilation right in the terminal.
Type `Ctrl-D` for `EOF`.

```bash
$ illusionist
class Foo {
  constructor() {
    console.log('Foo');
  }
}
```

### Compiling files and directories

`Illusionist` also accepts files and directories.

This would compile files in `assets/javascripts` to `public/javascripts`

```bash
illusionist assets/javascripts --out public/javascripts
```

You can also pass multiple paths:

```bash
illusionist foo-1.js foo-2.js some-folder/ --out public/
```

### Compiling a directory tree

Say you have a structure like this:

```
/my-app/app/assets/javascripts
├── application.js
├── components
│   └── foo_component.js
├── controllers
│   └── foo_controller.js
└── models
    └── foo.js
```

You can keep this structure when outputing to the `--out` directory with:

```bash
illusionist --tree --out public/ app/assets/javascripts/
```

## Node module

The module can take 3 options:

- `moduleName` - defines the AMD module name.  
__Passing this option will ignore `fileName` and `basePath`.__
- `fileName` - path to the file, used to define the AMD module name
- `basePath` - when passing `basePath` and `fileName`, the AMD module name will be `fileName` relative to `basePath`

```
// Module will be named 'controllers/foo_controller'
illusionist(stringOfES6, {moduleName: 'controllers/foo_controller'})

// Module will be named 'controllers/foo_controller'
illusionist(stringOfES6, {
  basePath: '/Volumes/mirego/MyApp/assets/js/',
  fileName: '/Volumes/mirego/MyApp/assets/js/controllers/foo_controller.js'
});

// Module will be named 'foo_controller'
illusionist(stringOfES6, {
  fileName: '/Volumes/mirego/MyApp/assets/js/controllers/foo_controller.js'
});
```

### Async version

```js
var illusionist = require('illusionist');
illusionist(stringOfES6, {fileName: 'outputFileName.js'}, function(err, stringOfES5) {
  // yay we have ES5 code!
});
```

### Sync version

```js
var illusionist = require('illusionist');
var es5Code = illusionist(stringOfES6, {fileName: 'outputFileName.js'}).render();
```

## Supported ES6 features

`Illusionist` is really just a wrapper for [jstransform](https://github.com/facebook/jstransform/) and [es6-module-transpiler](https://github.com/square/es6-module-transpiler).  
So for now, the features are:

### Arrow functions

```js
$('#element').on('click', (e) => {
  // `this` refers to the parent scope
});
```

### `class`, `extends`, `super` and short method definitions

```js
class Triangle extends Polygon {
  constructor(sides) {
    this.sides = sides;
    super();
  }

  render() {
    // ...
    super.render();
  }
}
```

### Object short notation

```js
function foo(x, y) {
  return {x, y}; // => {x: x, y: y}
};

function init({port, ip, coords: {x, y}}) {}
```

### Rest parameters

```js
function myConsole(...args) {
  console.log.apply(console, args);
}
```

### Templates

```js
var foo = `
  <div>Hello ${this.name.toUpperCase()}!</div>
  <div>This is nice</div>
`;
```

### `import`, `export` and `module`

__Note that for the time being, all modules are transpiled to AMD.__

#### Named Exports

You can export specific variables:

```js
// foobar.js
var foo = "foo", bar = "bar";
export { foo, bar };

// OR

export var foo = "foo";
export var bar = "bar";
```

And import them like this:

```js
import { foo, bar } from 'foobar';
```

#### Default Exports

You can export a *default* export:

```js
// jquery.js
var jQuery = function() {};

jQuery.prototype = {
  // ...
};

export default = jQuery;
```

And import it like this:

```
import $ from 'jquery';
```

#### Other syntax

Whereas the `import` keyword imports specific identifiers from a module, the `module` keyword creates an object that contains all of a module’s exports:

```
module foobar from 'foobar';
console.log(foobar.foo);
```

## License

`Illusionist` is © 2014 [Mirego](http://www.mirego.com) and may be freely distributed under the [New BSD license](http://opensource.org/licenses/BSD-3-Clause).  
See the [`LICENSE.md`](https://github.com/mirego/illusionist/blob/master/LICENSE.md) file.

## About Mirego

[Mirego](http://mirego.com) is a team of passionate people who believe that work is a place where you can innovate and have fun. We’re a team of [talented people](http://life.mirego.com) who imagine and build beautiful Web and mobile applications. We come together to share ideas and [change the world](http://mirego.org).

We also [love open-source software](http://open.mirego.com) and we try to give back to the community as much as we can.
