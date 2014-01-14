
# ki

**lisp + mori, sweet.js**

![ki](http://japanese.berkeley.edu/Pictures/L03/Kanji-ki.jpg)

ki is a lisp with Clojure data structures and semantics that can be intermixed with Javascript code at any level.

ki is a thin macro layer on top of [mori](https://github.com/swannodette/mori) plus a few constructs.

ki is in flux, feel free to test it out but expect glitches.


## Currently available functions / special forms

All of [mori](https://github.com/swannodette/mori) 

The following (growing) list of functions / special forms
```clojure
fn if when cond and or letv do prn js
```

## Examples

Require ki (this in turns expands into an appropriate require for mori)
```
ki require core
```

Mori's persistent data structures and Clojure(Script)-like api at your fingertips
```js
var foo = ki (vector 1 2 3)
ki (conj foo 4)
// => [1 2 3 4]
```

Plus lambdas
```js
ki (map (fn [a] (inc a)) (range 5))
// => (1 2 3 4 5)
```

Interoperability: write js in a ki form
```js
var fn1 = ki (js function (a,b) { return a + b + 2; })
```
at any level - e.g. you can use infix where it makes sense
```js
var fn2 = ki (fn [a b] (js a + b + 2))
```

and you can use ki wherever in js code
```js
function somefunc (a) {
  ki (clj_to_js (filter (fn [el] (is_even el)) (range a))).forEach(function(el) {
      console.log(el);
      });
  return [0, 1, 2, 3, 4].filter(ki (fn [el] (is_even el)));
}
console.log(somefunc(5));
// => 0 
// => 2 
// => 4 
// [0 2 4]
```

Like a pro
```js
ki (take 6 (map (fn [x] (js x * 2)) (range 1000)))
// => (0 2 4 6 8 10)
```


## Get it

First install [sweet.js](http://sweetjs.org) if you don't have it already

    $ npm install -g sweet.js

Note that sweet.js 0.4.0 is required, so make sure it's up to date

    $ npm update -g sweet.js

Then

    $ npm install ki

All set. Now to compile a ki js file into a plain js file do

    $ sjs -m ki/macros -o foo_build.js foo.js

To watch the file and have it automatically compiled whenever the file changes on disk

    $ sjs -m ki/macros -o foo_build.js -w foo.js


## License

MIT license http://www.opensource.org/licenses/mit-license.php/

Copyright (C) 2014 Luca Antiga http://lantiga.github.io


