
# ki roadmap

## 0.2.0 Make it a viable language

* **DONE** enclose every ki call in (function() {})(), if this doesn't break hygiene tricks
* **DONE** allow property access without (js ), e.g. (bar.dostuff 1 this.props) instead of ((js bar.dostuff) 1 (js this.props)) 
* **DONE** implement ki require to make it practical to use node modules

* **DONE** if when (TODO: use truthy)
* **DONE** cond (TODO: use truthy)
* **DONE** and or (TODO: use truthy)
* **DONE** not
* **DONE** eq neq 
* lt gt le ge
* add sub mul div mod
* **DONE** letv do
* **DONE** def defn 
* threading macros (tfirst, tlast)
* loop, recur, while
* **DONE** nil 
* **DONE** define truthiness (in line with ClojureScript)
  nil, false and undefined are false, all the rest is true (like in ClojureScript)
  (conversely to JavaScript, for which 0, NaN and "" are also logical false)
  When using predicates coming out of a (js ) form, we should make sure we get a
  consistent treatment of truthiness.
  In fogus/lemonad: 

    var _existy = function(x) { return x != null; };

    var _truthy = function(x) { 
      return (x !== false) && _existy(x); 
    };

  Mori has the same notion of truthiness as ClojureScript, so we're safe as far
  as long as core goes.

* testing

## 0.3.0 Add the nice to have

* add "application/ki" script type and in-browser expansion (browserify?)
* data literals
* destructuring
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

## 0.5.0 Add support for libraries

### Browser 

* React.js
* jQuery
* D3
* KnockoutJS

### Node

* Plain node
* Express

