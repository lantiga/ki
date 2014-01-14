/**
 * ki: mori + lisp + sweet.js
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * Copyright (C) 2014 Luca Antiga http://lantiga.github.io
 */

macro _args {
  rule { ($arg) } => {
    _sexpr $arg
  }
  rule { ($arg1.$arg2) } => {
    _sexpr $arg1.$arg2
  }
  rule { ($arg1.$arg2.$arg3) } => {
    _sexpr $arg1.$arg2.$arg3
  }
  rule { ($arg1.$arg2.$arg3.$arg4) } => {
    _sexpr $arg1.$arg2.$arg3.$arg4
  }
  rule { ($arg1.$arg2.$arg3.$arg4.$arg5) } => {
    _sexpr $arg1.$arg2.$arg3.$arg4.$arg5
  }
  rule { ($arg1.$arg2.$arg3.$arg4.$arg5.$arg6) } => {
    _sexpr $arg1.$arg2.$arg3.$arg4.$arg5.$arg6
  }
  rule { ($arg $args ...) } => {
    _sexpr $arg, _args ($args ...)
  }
  rule { ($arg1.$arg2 $args ...) } => {
    _sexpr $arg1.$arg2, _args ($args ...)
  }
  rule { ($arg1.$arg2.$arg3 $args ...) } => {
    _sexpr $arg1.$arg2.$arg3, _args ($args ...)
  }
  rule { ($arg1.$arg2.$arg3.$arg4 $args ...) } => {
    _sexpr $arg1.$arg2.$arg3.$arg4, _args ($args ...)
  }
  rule { ($arg1.$arg2.$arg3.$arg4.$arg5 $args ...) } => {
    _sexpr $arg1.$arg2.$arg3.$arg4.$arg5, _args ($args ...)
  }
  rule { ($arg1.$arg2.$arg3.$arg4.$arg5.$arg6 $args ...) } => {
    _sexpr $arg1.$arg2.$arg3.$arg4.$arg5.$arg6, _args ($args ...)
  }
}

//macro _args_case {
//  case { _ ($args ...) } => {
//
//    var arg = #{$args ...}[0];
//
//    var offset = 1;
//
//    //BooleanLiteral: 1,
//    //EOF: 2,
//    //Identifier: 3,
//    //Keyword: 4,
//    //NullLiteral: 5,
//    //NumericLiteral: 6,
//    //Punctuator: 7,
//    //StringLiteral: 8,
//    //RegularExpression: 9,
//    //Template: 10,
//    //Delimiter: 11
//
//    if (!(arg.token.type == 3 || (arg.token.type == 4 && arg.token.value == 'this'))) {
//
//      letstx $arg = [arg];
//      var rest = #{$args ...}.slice(offset);
//      if (rest.length == 0) {
//        return #{_sexpr $arg}
//      }
//      letstx $rest ... = rest;
//      return #{_sexpr $arg, _args ($rest ...)}
//    }
//
//    var ident = arg.token.value;
//    var currArg;
//
//    while (#{$args ...}[offset]) {
//      var dot = #{$args ...}[offset];
//      if (!(dot.token.type == 7 && dot.token.value == '.')) {
//        break;
//      }
//      var next = #{$args ...}[offset+1];
//      ident += '.' + next.token.value;
//      offset += 2;
//    }
//
//    letstx $arg = [makeIdent(ident,#{$args ...})];
//    var rest = #{$args ...}.slice(offset);
//    if (rest.length == 0) {
//      return #{_sexpr $arg}
//    }
//    letstx $rest ... = rest;
//    return #{_sexpr $arg, _args ($rest ...)}
//  }
//}

macro _fun {
  case { _ ((js $x ...)) } => {
    return #{$x ...}
  }
  case { _ ($f(.)...) } => {
    var farr = #{$f(.)...};
    var fun = '';
    for (var i=0; i<farr.length; i++) {
      fun += farr[i].token.value;
    }
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
      var mori = makeIdent("mori", #{$f(.)...});
      letstx $mori = [mori];
      return #{$mori.$f(.)...}
    }
    return #{$f(.)...}
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

  // TODO: use truthy here
  rule { (if $cond $sthen $selse) } => {
    _sexpr $cond ? _sexpr $sthen : _sexpr $selse
  }
  rule { (when $cond $sthen) } => {
    _sexpr $cond ? _sexpr $sthen : undefined
  }

  // TODO: use truthy here
  rule { (cond $cond1 $body1 $rest ...) } => {
    _sexpr $cond1 ? _sexpr $body1 : _sexpr (cond $rest ...)
  }
  rule { (cond) } => {
    undefined
  }

  rule { (and $sexpr1 $sexprs ...) } => {
    _sexpr $sexpr1 && _sexpr (and $sexprs ...)
  }
  rule { (and) } => {
    true
  }

  rule { (or $sexpr1 $sexprs ...) } => {
    _sexpr $sexpr1 || _sexpr (or $sexprs ...)
  }
  rule { (or) } => {
    false
  }

  rule { (letv [$k $v $rest ...] $sexprs ...) } => {
    (function ($k) {
      return (_sexpr (letv [$rest ...] $sexprs ...));
    })($v)
  }
  rule { (letv [] $sexprs ...) } => {
    (function () {
      _return_sexprs ($sexprs ...)
    })()
  }

  rule { (do $sexprs ...) } => {
    (function () {
      _return_sexprs ($sexprs ...)
    })()
  }

  rule { (prn $args ...) } => {
    console.log(_csep_sexprs($args ...))
  }

  rule { (js $body ...) } => {
    $body ...
  }

  rule { ($f(.)...) } => {
    _fun($f(.)...)()
  }

  // fix parsing issue in sweet.js in order
  // to express the following clauses in one
  // same for _args
  rule { ($f1.$f2.$f3.$f4.$f5.$f6 $args ...) } => {
    _fun($f1.$f2.$f3.$f4.$f5.$f6)( _args($args ...))
  }
  rule { ($f1.$f2.$f3.$f4.$f5 $args ...) } => {
    _fun($f1.$f2.$f3.$f4.$f5)( _args($args ...))
  }
  rule { ($f1.$f2.$f3.$f4 $args ...) } => {
    _fun($f1.$f2.$f3.$f4)( _args($args ...))
  }
  rule { ($f1.$f2.$f3 $args ...) } => {
    _fun($f1.$f2.$f3)( _args($args ...))
  }
  rule { ($f1.$f2 $args ...) } => {
    _fun($f1.$f2)( _args($args ...))
  }
  rule { ($f $args ...) } => {
    _fun($f)( _args($args ...))
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

macro _csep_sexprs {
  rule { ($sexpr) } => {
    _sexpr $sexpr
  }
  rule { ($sexpr $sexprs ...) } => {
    _sexpr $sexpr, _sexprs ($sexprs ...)
  }
}


macro ki {
  case { $n require core} => {
    var mori = makeIdent("mori", #{$n});
    var _ki = makeIdent("_ki", #{$n});
    letstx $mori = [mori];
    letstx $_ki = [_ki];
    return #{var $_ki = {}; var $mori = require('ki/node_modules/mori'); }
  }
  case { _ require $module ... as $name} => {
    var module = #{$module ...};
    var module_name = '';
    for (var i=0; i<module.length; i++) {
      module_name += module[i].token.value;
    }
    letstx $module_name = [makeValue(module_name,#{$name})];
    return #{var $name = require($module_name)}
  }
  case { _ ($x ...) } => {
    return #{(function() { return (_sexpr ($x ...)); })()}
  }
}

export ki;


