---
layout: default
title: ki
---

# ki

### A lisp for your JavaScript

ki is a functional programming language that expands into JavaScript through a very thin layer of [sweet.js](http://sweetjs.org) macros. It is designed to complement JavaScript, enriching it with functional programming idioms and immutable data structures. ki can be used to write entire applications, individual components (e.g. state management) or just functional one-liners.

ki syntax and semantics are heavily inspired by [Clojure](http://clojure.org). Thanks to [mori](http://swannodette.github.io/mori/), ki incorporates [ClojureScript](https://github.com/clojure/clojurescript)'s persistent data structures and related API. Here's a taste of what ki looks like when intermixed with JavaScript:

    var nums = ki (take 6 (map (fn [x] (js x * 2)) (range 1000)));

### Installing ki

    npm install -g ki

### Compiling ki code

    ki -o main.out.js main.js

### Features

ki has lambdas, lexical scoping, namespaces, local bindings, recursion, persistent data structures, lazyness, data literals, keywords, multiple arity functions, backcall-style continuations, multimethods, atoms and macros. And source maps.

### Documentation

<!-- [ki in 10 minutes]() -->

[ReactJS tutorial in ki](/react.html)

[ki reference](/api.html)

### License

[MIT license](http://www.opensource.org/licenses/mit-license.php/), Copyright (C) 2014 [Luca Antiga](http://lantiga.github.io).

### Contact me

Reach me on GitHub ([@lantiga](https://github.com/lantiga)) or Twitter ([@lantiga](http://twitter.com/lantiga)).

