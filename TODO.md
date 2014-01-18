
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
* lt gt le ge
* add sub mul div mod
* **DONE** letv 
* **DONE** do
* **DONE** def defn 
* threading macros (tfirst, tlast)
* loop, recur, while
* **DONE** nil 
* **DONE** define truthiness (in line with ClojureScript and Mori)
* **DONE** ns: every ki () form should introduce a namespace, either anonymous 
  (no ns form) or named, ki (ns foobar (def ...))
  Every def (and defn) should define a var as well as place the value in
  the _ki object, so that it can be used/interned in other ki blocks with different 
  namespaces (or other ki blocks with the same namespace).
* **DONE** fully qualified identifiers foo/bar
* **DONE** use: intern all functions of a module (TODO: warn on aliasing)
* fn arity check and multiple arities
* **DONE** support js object creation with js new, or just decide to leave it as 
  (js new Date) I like this option better (we should document it and that's it)

* testing

* blog
* create something like http://kanaka.github.io/clojurescript/web/synonym.html
* look at https://github.com/jbr/sibilant http://sibilantjs.info/

## 0.3.0 Add the nice to have

* add "application/ki" script type and in-browser expansion (browserify?)
* data literals
* destructuring
* named parameters and defaults
* regular expressions
* exceptions
* expression problem
* additional functions/forms
  * condp case
  * for (comprehension)

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

