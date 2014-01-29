
# ki roadmap

## 0.2.0 Make it a viable language

* **DONE** enclose every ki call in (function() {})(), if this doesn't break hygiene tricks
* **DONE** allow property access without (js ), e.g. (bar.dostuff 1 this.props) instead of 
  ((js bar.dostuff) 1 (js this.props)) 
* **DONE** implement ki require to make it practical to use node modules
* **DONE** if when 
* **DONE** cond 
* **DONE** and or 
* **DONE** not
* **DONE** eq neq 
* **DONE** letv 
* **DONE** do
* **DONE** def defn 
* **DONE** nil 
* **DONE** define truthiness (in line with ClojureScript and Mori)
* **DONE** ns: every ki () form should introduce a namespace, either anonymous 
  (no ns form) or named, ki (ns foobar (def ...))
  Every def (and defn) should define a var as well as place the value in
  the _ki object, so that it can be used/interned in other ki blocks with different 
  namespaces (or other ki blocks with the same namespace).
* **DONE** fully qualified identifiers foo/bar
* **DONE** use: intern all functions of a module (TODO: warn on aliasing)
* **DONE** support js object creation with js new, or just decide to leave it as 
  (js new Date) I like this option better (we should document it and that's it)
* **DONE** data literals
* **DONE** loop, recur, while 
* **DONE** multiple arities
* **DONE** threading macros 
* **DONE** chaining, doto
* **DONE** add sub mul div mod
* **DONE** lt gt leq geq
* **DONE** letc (backcalls style continuations)
* **DONE** keywords **TODO** keywords do not evaluate to themselves and do not extract values from collections
* atom swap reset deref watchers (read and write)
* apply
* bind
* allow to run in browser

* **DONE** testing

* example with node
* example with React

## 0.3.0 Add the nice to have

* CPS modeled after tame.js
  In tame we would have something like
    (await (setTimeout (defer) 100))
    (prn "Hello!")
  which would require exploring the AST. It could become something like
    (with_defers [a]
     (await (setTimeout a 100))
     (prn "Hello!"))
  or even more explicitly
    (with_defers [a]
     (await a (setTimeout a 100))
     (prn "Hello!"))
  which could also be used as
    (with_defers [a]
     (setTimeout a 100)
     (await a)
     (prn "Hello!"))
  Or just limit defers to last argument as in letc. The advantage over letc is 
  easier parallelism of e.g. multiple requests to server.
* destructuring
* named parameters and defaults
* optional arguments to functions (catpured in a vector)
* regular expressions
* exceptions
* expression problem
* additional functions/forms
  * condp case
  * for (comprehension)
* "application/ki" script type and in-browser expansion (browserify?)
* create something like http://kanaka.github.io/clojurescript/web/synonym.html

## 0.4.0 Make it a real lisp

* implement macros in pure ki
  Workflow: ki script reads the input file, identifies forms with ki macro foo, 
  or (defmacro foo ...) inside ki forms (we'll have to choose), builds a string
  of code to execute in ki (i.e. complied through sweet.js as a library and 
  executed in node), that defines macros as functions and calls a macroexpand
  function that takes in input the input file and returns a string in which all
  invocations of (foo ...) are replaced with their expanded version.
  The result is then compiled in sweet.js and written in output.
* have a ki script replace the sjs script for handling the double pass
  Also informative: https://github.com/swannodette/hello-cljsc/blob/master/src/hello-cljsc/core.clj
* browserify the ki script
* make LightTable plugin

## 0.5.0 Add support for libraries

### Browser 

* React.js
* jQuery
* D3
* KnockoutJS

### Node

* Plain node
* Express

