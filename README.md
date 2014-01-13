
# kin

** mori + lisp + sweet.js **

kin is a lisp with Clojure data structures and semantics that can be intermixed with Javascript code at any level.

kin is a thin macro layer on top of [mori](https://github.com/swannodette/mori) plus a few constructs.

kin is in flux, feel free to test it out but expect glitches.


## Examples

Require mori
```
var mori = require('mori');
```

Mori's persistent data structures and Clojure(Script)-like api at your fingertips
```js
var foo = kin (vector 1 2 3)
kin (conj foo 4)
// => [1 2 3 4]
```

Plus lambdas
```js
kin (map (fn [a] (inc a)) (range 5))
// => (1 2 3 4 5)
```

Interoperability: write js in a kin form
```js
var fn1 = kin (js function (a,b) { return a + b + 2; })
```
at any level - e.g. you can use infix where it makes sense
```js
var fn2 = kin (fn [a b] (js a + b + 2))
```

and you can use kin wherever in js code
```js
function somefunc (a) {
  kin (clj_to_js (filter (fn [el] (is_even el)) (range a))).forEach(function(el) {
      console.log(el);
        });
          return [0, 1, 2, 3, 4].filter(kin (fn [el] (is_even el)));
          }
          console.log(somefunc(5));

          // Like a pro
          kin (take 6 (map (fn [x] (js x * 2)) (range 1000)))
          // => (0 2 4 6 8 10)
```


## Get it

First install [sweet.js](http://sweetjs.org) if you don't have it already

    $ npm install -g sweet.js

If you do have it, update it (0.4.0 is required)

    $ npm update -g sweet.js

Then

    $ npm install kin

All set. Now to compile a kin js file into a plain js file do

    $ sjs -m kin/macros -o foo_build.js foo.js

To watch the file and have it automatically compiled whenever the file changes on disk

    $ sjs -m kin/macros -o foo_build.js -w foo.js


## License

MIT license http://www.opensource.org/licenses/mit-license.php/

Copyright (C) 2014 Luca Antiga http://lantiga.github.io


