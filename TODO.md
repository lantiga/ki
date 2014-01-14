
# ki roadmap

ki has some potential 

## 0.2.0 Make it a viable language

* **DONE** enclose every ki call in (function() {})(), if this doesn't break hygiene tricks
* **DONE** allow property access without (js ), e.g. (bar.dostuff 1 this.props) instead of ((js bar.dostuff) 1 (js this.props)) 
* **DONE** implement ki require to make it practical to use node modules

* **DONE** if when (TODO: use truthy)
* **DONE** cond (TODO: use truthy)
* condp case
* **DONE** and or (TODO: use truthy)
* define truthy, falsey (in line with Clojure and Mori)
* **DONE** letv do
* def defn (make these accessible from the outside)
* threadng macros (->, ->>)
* loop, recur, for, while

* testing

## 0.3.0 Add the nice to have

* add "application/ki" script type and in-browser expansion (browserify?)
* data literals
* destructuring

## 0.4.0 Make it a real lisp

* implement macros in pure ki
* have a ki script replace the sjs script for handling the double pass
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

