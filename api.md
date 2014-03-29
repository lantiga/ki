---
layout: default
title: ki reference
---

<style>
  body {
    font-size: small;
  }
</style>

# ki reference

#### Basics

[Basics](#basics)
[Literals](#literals)
[Arithmetics](#arithmetics)
[Comparisons](#comparisons)
[Logical](#logical)
[Functions](#functions)
[Atoms](#atoms)
[Exceptions](#exceptions)
[Flow](#flow)
[Conditionals](#conditionals)
[Multimethods](#multimethods)
[Interoperability](#interoperability)
[Variables](#variables)
[Namespaces](#namespaces)
[Looping and recursion](#looping-and-recursion)
[Local bindings](#local-bindings)
[Misc](#misc)

<!--
#### Core library (mori)

[Fundamentals](#fundamentals)
[Type predicates](#type-predicates)
[Collections](#collections)
[Collection operations](#collection-operations)
[Vector operations](#vector-operations)
[Hash map operations](#hash-map-operations)
[Set operations](#set-operations)
[Sequences](#sequences)
[Helpers](#helpers)
-->

<hr/>

### Basics 

#### `ki require`
##### `ki require core`
##### `ki require 'module_name' as name`

Requires a node module using [node's require](http://nodejs.org/api/modules.html#modules_module_require_id) and makes it available to all ki namespaces by binding the returned object to the provided `name`. It has to be called outside ki forms.

`ki require core` initializes a `_ki` global object (where namespaces, modules and defines are stored), requires [mori](http://swannodette.github.io/mori/) and exposes all its functions to all ki namespaces. `ki require core` needs to be invoked before any ki forms or any other ki statement. Every invocation reinitializes the `_ki` object.

    ki require core
    ki require 'fs' as fs

    ki (fs.readFile "somefile.txt" 
        (fn [err data] data));

#### `ki macro`
##### `ki macro (from_expr ...) (to_expr ...)`

Defines a macro that expands an expression into another expression in subsequent ki forms. Expressions are specified using [sweet.js](http://sweetjs.org/) pattern matching rules.

    ki macro (thunk $body ...)
             (fn [] $body ...)

    ki (thunk (alert "Whoops!"));

#### `ki ()`
##### `ki (expr ...)`

Evaluates a ki form, returning its result to the enclosing JavaScript expression. The form is either evaluated within an explicit namespace (with `(ns ...)`) or within an anonymous namespace. Such namespace is retained for use in subsequent non-namespaced ki forms.

    var foo = ki (range 1000);
    var bar = ki (ns my_ns (range 1000));

    ki (def foo 5);
    ki (prn foo);      => 5

### Literals

#### `[]`
##### `[val1 val2 ...]`

Creates a persistent vector (see [mori](http://swannodette.github.io/mori/)). Note: avoid punctuation between elements.

    [1 2 "a" :b]

#### `{}`
##### `{key1 val1 key2 val2 ...}`

Creates a persistent hash map (see [mori](http://swannodette.github.io/mori/)). Note: avoid punctuation between elements.

    {:foo 1 "bar" [1 2 3] {:a 2 :b 3} 4}

#### `[$ ]`
##### `[$ val1 val2 ...]`

Creates a JavaScript array using an analogous notation to persistent data structures.

    [$ 1 2 "a" "b"]

#### `{$ }`
##### `{$ key1 val1 key2 val2 ...}`

Creates a JavaScript object using an analogous notation to persistent data structures. Note: keys cannot be objects or arrays.

    {$ a 1 "b" 2}

#### `:keyword`

Creates a ClojureScript keyword (see [mori](http://swannodette.github.io/mori/)). Equivalent to `(keyword ...)`.

    (def a :foo)
    (def b {:a 1 :b 2})

#### `nil`

Synonym for JavaScript null.

    (def a nil)

### Arithmetics

#### `add`
##### `(add arg1 arg2 ...)`

Returns the sum of the arguments

    (add 1 1 2 2)       => 6

#### `sub`
##### `(sub arg1 arg2 ...)`

Returns the difference among the arguments

    (sub 4 2 1)         => 1

#### `mul`
##### `(mul arg1 arg2 ...)`

Returns the product of the arguments

    (mul 4 2 2)         => 16

#### `div`
##### `(div arg1 arg2 ...)`

Returns the result of the division between the arguments

    (div 8 2 2)         => 2

#### `mod`
##### `(mod arg1 arg2)`

Returns the rest of the integer division between two numbers

    (mod 5 3)           => 2

### Comparisons

#### `eq` 
##### `(eq arg1 arg2 ...)`

Returns true if the arguments are equal. Equivalent to mori [equals](http://swannodette.github.io/mori/#equals), i.e. it tests deep equality on persistent collections.

    (def a 1)
    (def b 1)
    (eq a b 1)              => true
    (def b [1 [2 {:a 3}]])
    (eq b [1 [2 {:a 3}]]    => true

#### `neq`
##### `(neq arg1 arg2 ...)`

Returns false if the arguments are not equal (see eq).

    (neq [1 2] [1 2] [1 3]) => true

#### `geq`
##### `(geq arg1 arg2 ...)`

Returns true if a "greater than or equal" relationship holds for the arguments.

    (geq 3 2 2)             => true

#### `leq`
##### `(leq arg1 arg2 ...)`

Returns true if a "less than or equal" relationship holds for the arguments.

    (leq 2 2 3)             => true

#### `gt`
##### `(gt arg1 arg2 ...)`

Returns true if a "greater than" relationship holds for the arguments.

    (gt 3 2 1)              => true

#### `lt`
##### `(lt arg1 arg2 ...)`

Returns true if a "less than" relationship holds for the arguments.

    (lt 1 2 3)              => true

### Logical

#### `and`
##### `(and arg1 arg2 ...)`

Returns true if all the arguments evaluate to truthy (i.e. not false, undefined or null).

    (and true 1 "a")        => true

#### `or`
##### `(or arg1 arg2 ...)`

Returns true if at least one of the arguments evaluates to truthy (i.e. not false, undefined or null).

    (or false null 0)      => true

#### `not`
##### `(not arg)`

Returns true if the argument evaluates to falsey (i.e. false, undefined or null). Synonym of falsey.

    (not null)              => true

#### `truthy`
##### `(truthy arg)`

Returns true if the argument is not false, undefined or null.

    (truthy "")              => true

#### `falsey`
##### `(falsey arg)`

Returns true if the argument is false, undefined or null.

    (falsey 0)              => false
    (falsey null)           => true

### Functions

#### `fn`
##### `(fn [arg1 arg2 ...] body)`

Returns an anonymous function taking n arguments and returning the result of the evaluation of the last form in the body. The returned function is a JavaScript function. Evaluating the function with fewer or more arguments than specified in the signature will not generate an error.

    (fn [x] (prn x) (inc x))

Functions with multiple arities are supported. They can be defined by supplying their signatures in the same fn form. If evaluated with a number of arguments that doesn't match any of the arities, the version with the greater arity is called.

    (fn 
      ([arg1 ... argN] body1)
      ([arg1 ... argM] body2)
      ...)

    (fn
      ([] 0)
      ([x] x)
      ([x y] (add x y)))

#### `apply`
##### `(apply func coll)`

Evaluates the supplied function with the elements of the provided collection as arguments.

    (apply add [1 2 3])     => 6

An extra argument can be provided after the function name as the object that will be bound to `this` upon invocation.

    (apply add {$ a 1} [this.a 2 3])     => 6

#### `bind`
##### `(bind obj func)`

Binds the supplied function to the object.

    (bind {$ a 1} (fn [] this.a))

#### `fnth`
##### `(fnth [arg1 arg2 ...] body)`

Returns an anonymous function and binds it to `this` in the current scope (analogous to CoffeeScript's [fat arrow](http://coffeescript.org/#fat-arrow))

    (defn Account [customer cart]
      (js this.customer = customer)
      (js this.cart = cart)

      (chain 
       ($ '.shopping-cart')
       (on 'click' (fnth [event] (this.customer.purchase this.cart)))))

#### `defn`
##### `(defn fn_name [arg1 arg2 ...] body)`

Defines a function (see fn), binds it to a JavaScript variable and makes it available in the current namespace. Multiple arities work as for fn.

    (defn fn_name
      ([arg1 ... argN] body1)
      ([arg1 ... argM] body2)
      ...)
   
    (defn print_and_inc [x] 
      (prn x) 
      (inc x))

    (defn some_func
      ([] 0)
      ([x] x)
      ([x y] (add x y)))


### Atoms

#### `atom`
##### `(atom val write_fn read_fn)`

Returns a JavaScript object acting as a reference to a value. The value can be later accessed using deref and changed using swap and reset. It is typically intended to hold mutable state. Takes the initial value and two (optional) callbacks as arguments. The first (write callback) is invoked when the value is changed (through swap or reset) with the new value and the old value as arguments. The second (read callback) is invoked whenever the atom is dereferenced (through deref) with the value as argument.

    (def a (atom {:a 1 :b 2}))
    (def b (atom 1) (fn [val old_val] (prn "Old:" old_val "New:" val)))
    (def c (atom 1) nil (fn [val] (prn "Someone just read:" val)))

#### `deref`
##### `(deref atom)`

Returns the current value of an atom.

    (def a (atom 1))
    (deref a)               => 1

#### `swap`
##### `(swap atom func arg1 arg2 ...)`

Takes an atom, a function and optional arguments, changes the value of the atom to be the return value of the function evaluated with the old value and the provided optional arguments as arguments.

    (def a (atom 1))
    (swap a inc)
    (deref a)               => 2
    (swap a add 2)
    (deref a)               => 4

#### `reset`
##### `(reset atom val)`

Takes an atom and a value and changes the value of the atom to the provided value.

    (def a (atom 1))
    (reset a 2)
    (deref a)               => 2

### Exceptions

#### `try/catch/finally`
##### `(try body (catch e catch_body) (finally finally_body))`

Evaluates the body and catches the eventual exception. It optionally supports a `finally` form meant to perform side-effects both in the case the exception is thrown or not.

    (try
      (div 1 0)
      (catch e (prn "Exception caught" e)))

#### `throw`
##### `(throw exception_object)`

Throws an exception with the supplied value.

    (throw "Error")
    (throw (str "Error with value" 42))
    (throw nil)
    (try
      (div 1 0)
      (catch e (do (prn "Exception caught, rethrowing") 
                   (throw e))))

### Flow

#### `threadf`
##### `(threadf val (func1 arg2 arg3 ...) (func2 arg2 arg3 ...))`

Threads a value through a sequence of computations. It takes the first argument and it supplies it as the first argument to the second form. The result of the evaluation is supplied as the first argument to the third form and so on. It returns the result of the last evaluation.

    (threadf 2 (mul 2) (add 1) (div 2))   => 2.5

#### `threadl`
##### `(threadl val (func1 arg1 ... argN-1) (func2 arg1 ... argN-1))`

Threads a value through a sequence of computations. It takes the first argument and it supplies it as the last argument to the second form. The result of the evaluation is supplied as the last argument to the third form and so on. It returns the result of the last evaluation.

    (threadl (range 10) (filter is_even) (map (mul 2)))   => [0 4 8 12 16]

#### `do`
##### `(do (func1 arg1 arg2 ...) (func2 arg1 arg2 ...))`

Evaluates all the supplied forms in order and returns the result of the last evaluation. Typically used for side effects

    (do (prn "Value is 1") 1)

#### `chain`
##### `(chain obj (method1 arg1 arg2 ...) (method2 arg1 arg2 ...))`

Evaluates the form supplied as the second argument, where the function is treated as a property of the first argument (expected to be a JavaScript object), then does the same for the third argument and the object returned by the previous evaluation and so on.

    (chain d3 (select "body") (append "p") (text "New paragraph"))

#### `doto`
##### `(doto obj (method1 arg1 arg2 ...) (method2 arg1 arg2 ...))`

Takes the first argument (expected to be a JavaScript object) and evaluates all subsequent forms treating functions as properties of the first argument.

    (doto document.body 
          (appendChild (document.createElement "p"))
          (appendChild (document.createElement "p"))

### Conditionals

#### `if`
##### `(if condition do_if_truthy do_if_falsey)`

Returns the result of the evaluation of the second form if the evaluation of the first form is truthy, the result of the evaluation of the third form otherwise.

    (if (gt 2 1) "2 > 1" "1 > 2")   => "2 > 1"

#### `if_not`
##### `(if_not condition do_if_falsey do_if_truthy)`

Returns the result of the evaluation of the second form if the evaluation of the first form is falsey, the result of the evaluation of the third form otherwise.
    
    (if_not (gt 2 1) "not 2 > 1" "not 1 > 2")   => "not 1 > 2"

#### `when`
##### `(when condition do_if_truthy)`

Returns the result of the evaluation of the second form if the evaluation of the first form is truthy, nil otherwise.
    
    (when (lt 2 1) "2 < 1")   => nil

#### `when_not`
##### `(when_not condition do_if_falsey)`

Returns the result of the evaluation of the second form if the evaluation of the first form is falsey, nil otherwise.
    
    (when_not (gt 2 1) "2 > 1")   => nil

#### `cond`
##### `(cond cond1 do_if_cont1_truthy cond2 do_if_cond2_falsey ...)`

Returns the result of the evaluation of the second form if the first form evaluates to truthy, the result of the evaluation of the fourth form if the third form evaluates to truthy and so on.

    (cond
      (eq action "Eat apple") (swap energy inc)
      (eq action "Drink potion") (swap energy (partial add 5))
      :else energy)

### Multimethods

#### `defmulti`
##### `(defmulti fn_name dispatch_fn)`

Defines a multimethod given a name and a dispatch function. When invoked, it calls the function (provided using defmethod) that matches the return value of the dispatch function evaluated with the supplied arguments.

    (defmulti sound (fn [animal] (get animal :type)))

#### `defmethod`
##### `(defmethod fn_name dispatch_value [arg1 arg2 ...] body)`

Defines a method given the name of the multimethod, a value against which the return value of the dispatch function is matched, a list of arguments and a function body.

    (defmethod sound :cat [animal] "mieow")
    (defmethod sound :dog [animal] "woof")

### Interoperability

#### `js`
##### `(js body)`

Treats arguments as JavaScript code, which gets expanded in the enclosing scope.

    (js x + 1)
    (js function(x) { x + 1 })

### Namespaces

#### `ns`
##### `(ns ns_name body)`

Introduces a namespace with the given name. All variables and functions defined using `(def )` and `(defn )` forms are namespace globals and are available between separate `(ns )` forms with the same name. Namespace global variables can be accessed from other namespaces using the `<ns>/<var>` notation. Every `ki ()` form introduces an anonymous namespace. Namespaces can be nested.

    (ns foo (def a 1))
    (ns bar (def a 2))
    (ns foo a)           => 1
    (ns bar foo/a)       => 1

#### `use`
##### `(use ns_name)`

Interns all variables of the supplied namespace into the current namespace

    (ns foo (def a 1))
    (ns bar (use foo) a)    => 1

### Variables

#### `def`
##### `(def name value)`

Defines a variable with the supplied name in the current namespace and binds it to the supplied value. The variable will be defined and will be bound to the same value in subsequent `(ns ...)` forms with the same namespace.

    (def foo 1)

### Looping and recursion

#### `while`
##### `(while cond body)`

Repeatedly evaluates body until cond stops evaluating to truthy.

    (def counter (atom 10))
    (while (geq (deref counter) 0)
      (do
       (prn counter)
       (swap counter dec)))

#### `loop/recur`
##### (loop [name1 val1 name2 val2 ...] body ... (recur newval1 newval2 ...))

Evaluates body with the supplied local bindings. If `recur` is reached, re-evaluates body with bindings bound to the new supplied values. Returns the result of the last evaluated expression.

    (loop [counter 10]
      (prn counter)
      (if_not (geq counter 0)
        "Ignition!"
        (recur (dec counter))))

### Local bindings

#### `letv`
##### `(letv [name1 val1 name2 val2 ...] body ...)`

Evaluates body with the supplied local bindings. Returns the result of the last evaluated expression.

    (letv [a 1
           b 2]
      (add a b))        => 3

    (letv [a 1]
      (letv [a (inc a)
             b 2]
        (add a b)))     => 4

#### `letc`
##### `(letc [name1 (fn1 arg1 ... argN-1) name2 (fn2 arg1 ... argN-1) ...] body ...)`

Evaluates supplied functions by passing a callback taking the bindings as the last argument. Returns nil.

It allows to write callback-based APIs sequentially. The following

    ki require 'fs' as fs

    ki (letc [[err1 data1] (fs.readFile "first.csv")
              [err2 data2] (fs.readFile "second.csv")]
              {:first data1 :second data2})

is equivalent to

    ki require 'fs' as fs

    ki (fs.readFile "first.csv" 
        (fn [err1 data1]
         (fs.readFile "second.csv" 
          (fn [err2 data2]
           {:first data1 :second data2}))))

### Misc

#### `str`
##### `(str arg1 arg2 ...)`

Converts the arguments to string and returns their concatenation (with a single space separator).

    (str "One is" 1 "and two is" 2)    => "One is 1 and two is 2"

#### `prn`
##### `(prn arg1 arg2 ...)`

Converts the arguments to string and outputs their concatenation to standard output.

    (prn "One is" 1 "and two is" 2)

<!--
<hr/>

## Core library (mori)

What follows is taken from [mori](http://swannodette.github.io/mori/). It is reported here in *ki* syntax for convenience.

### Fundamentals

### Type predicates

### Collections

### Collection operations

### Vector operations

### Hash map operations

### Set operations

### Sequences

### Helpers

-->
