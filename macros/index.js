/**
 * kin: mori + lisp + sweet.js
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * Copyright (C) 2014 Luca Antiga http://lantiga.github.io
 */

macro _args {
  rule { ($arg) } => {
    _sexpr $arg
  }
  rule { ($arg $args ...) } => {
    _sexpr $arg, _args ($args ...)
  }
}

macro _fun {
  case { _ ($f) } => {
    var fun = unwrapSyntax(#{$f});
    var mori_funs = {
      // Fundamentals
      equals: true,
      hash: true,
      // Type predicates
      is_list: true,
      is_seq: true,
      is_vector: true,
      is_map: true,
      is_set: true,
      is_collection: true,
      is_sequential: true,
      is_associative: true,
      is_counted: true,
      is_indexed: true,
      is_reduceable: true,
      is_seqable: true,
      is_reversible: true,
      // Collections
      list: true,
      vector: true,
      hash_map: true,
      set: true,
      sorted_set: true,
      range: true,
      // Collection operations
      conj: true,
      into: true,
      assoc: true,
      dissoc: true,
      empty: true,
      get: true,
      get_in: true,
      has_key: true,
      find: true,
      nth: true,
      last: true,
      assoc_in: true,
      update_in: true,
      count: true,
      is_empty: true,
      peek: true,
      pop: true,
      zipmap: true,
      reverse: true,
      // Vector operations
      subvec: true,
      // Hash map operations
      keys: true,
      vals: true,
      // Set operations
      disj: true,
      union: true,
      intersection: true,
      difference: true,
      is_subset: true,
      is_superset: true,
      // Sequences
      first: true,
      rest: true,
      seq: true,
      cons: true,
      concat: true,
      flatten: true,
      into_array: true,
      each: true,
      map: true,
      mapcat: true,
      filter: true,
      remove: true,
      reduce: true,
      reduce_kv: true,
      take: true,
      take_while: true,
      drop: true,
      drop_while: true,
      some: true,
      every: true,
      sort: true,
      sort_by: true,
      interpose: true,
      interleave: true,
      iterate: true,
      repeat: true,
      repeatedly: true,
      partition: true,
      partition_by: true,
      group_by: true,
      // Helpers
      prim_seq: true,
      identity: true,
      constantly: true,
      inc: true,
      dec: true,
      sum: true,
      is_even: true,
      is_odd: true,
      comp: true,
      juxt: true,
      knit: true,
      pipeline: true,
      partial: true,
      curry: true,
      fnil: true,
      js_to_clj: true,
      clj_to_js: true
    }
    if (mori_funs[fun]) {
      return #{mori.$f}
    }
    return #{$f}
  }
}

macro _keys {
  rule { ($($k $v)) } => {
    $k
  }
  rule { ($($k $v) $($ks $vs) ...) } => {
    $k, _keys ($($ks $vs) ...)
  }
}

macro _vals {
  rule { ($($k $v)) } => {
    $v
  }
  rule { ($($k $v) $($ks $vs) ...) } => {
    $v, _vals ($($ks $vs) ...)
  }
}

macro _sexpr {
  rule { () } => { 
  }
  rule { (fn [$args ...] $sexprs ...) } => {
    function ($args(,)...) {
      _return_sexprs ($sexprs ...)
    }
  }
  //rule { (letv [$($k $v) ...] $sexprs ...) } => {
  //  function ( _keys($($k $v) ...) ) {
  //    _return_sexprs ($sexprs ...)
  //  }(_vals ($($k $v) ...))
  //}
  rule { (prn $args ...) } => {
    console.log(_sexprs($args ...))
  }
  rule { (js $body ...) } => {
    $body ...
  }
  rule { ($f) } => {
    _fun($f)()
  }
  rule { ($f $arg) } => {
    _fun($f)(_args($arg))
  }
  rule { ($f $arg $args ...) } => {
    _fun($f)( _args($arg) , _args($args ...))
  }
  rule { $x } => { $x }
}

macro _return_sexprs {
  rule { ($sexpr) } => {
    return _sexpr $sexpr
  }
  rule { ($sexpr $sexprs ...) } => {
    _sexpr $sexpr _return_sexprs ($sexprs ...)
  }
}

macro _sexprs {
  rule { ($sexpr) } => {
    _sexpr $sexpr
  }
  rule { ($sexpr $sexprs ...) } => {
    _sexpr $sexpr _sexprs ($sexprs ...)
  }
}

macro kin {
  rule { ($x ...) } => {
    _sexpr ($x ...)
  }
}

// EXAMPLES

var mori = require('mori');

// Mori at your fingertips
var foo = kin (vector 1 2 3)
kin (conj foo 4)
// => [1 2 3 4]

// Plus lambdas
kin (map (fn [a] (inc a)) (range 5))
// => (1 2 3 4 5)

// Interoperability: write js in a kin form
var fn1 = kin (js function (a,b) { return a + b + 2; })

// at any level - e.g. you can use infix where it makes sense
var fn2 = kin (fn [a b] (js a + b + 2))

// and you can use kin wherever in js code
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


// TODO: 
// * letv (impl. above doesn't work due to parsing quirks)
// * literals
// * math expressions -> use infix (SOLVED)
// * destructuring
// * threading macros


