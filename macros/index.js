/**
 * ki: a sane lisp for your JavaScript
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * Copyright (C) 2014 Luca Antiga http://lantiga.github.io
 */

//BooleanLiteral: 1,
//EOF: 2,
//Identifier: 3,
//Keyword: 4,
//NullLiteral: 5,
//NumericLiteral: 6,
//Punctuator: 7,
//StringLiteral: 8,
//RegularExpression: 9,
//Template: 10,
//Delimiter: 11

macro _fun {
  case { _ ((js $x ...)) } => {
    return #{$x ...}
  }
  case { _ ($ns/$f) } => {
    return #{ _ki.namespaces.$ns.vars.$f };
  }
  case { _ ($f) } => {
    return #{$f}; 
  }
  case { _ ($f(.)...) } => {
    var farr = #{$f(.)...};
    if (farr.length == 1) {
      letstx $fn = [farr[0]];
      //return #{_sexpr $fn};
      return #{$fn};
    }
    return #{$f(.)...};
  }
}

macro _args {
  rule { ($arg) } => {
    _sexpr $arg
  }
  rule { ($ns/$arg) } => {
    _sexpr _ki.namespaces.$ns.vars.$arg
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

macro _x {
  case { $ctx null } => {
    throwSyntaxError('ki','<null> is not a valid identifier, use nil',#{$ctx})
  }
  case { $ctx undefined } => {
    throwSyntaxError('ki','<undefined> is not a valid identifier, use nil',#{$ctx})
  }
  case { _ nil } => {
    return #{null}
  }
  case { _ $x} => {
    return #{$x}
  }
}

macro _ns {
  case { _ $ns $sexprs ... } => {
    var nsname = unwrapSyntax(#{$ns});
    letstx $nsname = [makeValue(nsname,#{$ns})];
    return #{
      (function () {
        if (_ki.namespaces.$ns === undefined) {
          _ki.namespaces.$ns = { vars: {} };
        }
        this['_ki_ns_name'] = $nsname;
        this['_ki_ns_ctx'] = this;
        _ki.intern.bind(this)(_ki.modules.core);
        _ki.intern.bind(this)(_ki.modules.mori);
        _ki.intern.bind(this)(_ki.namespaces[_ki_ns_name].vars);
        _return_sexprs ($sexprs ...);
      })()
    }
  }
}

macro _use {
  case { _ $modules ...} => {
    return #{
      for (var m in $modules ...) {
        _ki.intern.bind(_ki_ns_ctx)(_ki.modules[m]);
      }
    }
  }
}

macro _def {
  case { _ $n $sexpr } => {
    var varname = unwrapSyntax(#{$n});
    letstx $varname = [makeValue(varname,#{$n})];
    return #{
      //(function($n) {
      var $n = _sexpr $sexpr;
      _ki_ns_ctx[$varname] = _sexpr $sexpr;
      _ki.namespaces[_ki_ns_name].vars.$n = _ki_ns_ctx[$varname]
      //_ki_ns_ctx.$n = _sexpr $sexpr;
      //_ki.namespaces[_ki_ns_name].vars.$n = _ki_ns_ctx.$n
      //})($n) 
    };
  }
}

macro _sexpr {

  rule { () } => { 
  }
  
  rule { (ns $ns $sexprs ...) } => {
    _ns $ns $sexprs ...
  }

  rule { (use $modules ...) } => {
    _use $modules ...
  }

  rule { (fn [$args ...] $sexprs ...) } => {
    function ($args(,)...) {
      _return_sexprs ($sexprs ...)
    }
  }

  rule { (truthy $sexpr) } => {
    (function () {
      var tmp = _sexpr $sexpr;
      return tmp === false || tmp == null ? false : true;
    })()
  }

  rule { (falsey $sexpr) } => {
    ! _sexpr (truthy $sexpr)
  }

  rule { (not $sexpr) } => {
    _sexpr (falsey $sexpr)
  }

  rule { (eq ) } => {
    true
  }
  rule { (eq $sexpr1 $sexpr2) } => {
    _sexpr (equals $sexpr1 $sexpr2)
  }
  rule { (eq $sexpr1 $sexpr2 $sexprs ...) } => {
    _sexpr (and (eq $sexpr1 $sexpr2) (eq $sexpr2 $sexprs ...))
  }

  rule { (neq $sexprs ...) } => {
    _sexpr (not (eq $sexprs ...))
  }

  rule { (if $cond $sthen $selse) } => {
    _sexpr (truthy $cond) ? _sexpr $sthen : _sexpr $selse
  }

  rule { (when $cond $sthen) } => {
    _sexpr (truthy $cond) ? _sexpr $sthen : undefined
  }

  rule { (cond $cond1 $body1 $rest ...) } => {
    _sexpr (truthy $cond1) ? _sexpr $body1 : _sexpr (cond $rest ...)
  }
  rule { (cond) } => {
    undefined
  }

  rule { (and $sexpr1 ) } => {
    _sexpr (truthy $sexpr1)
  }
  rule { (and $sexpr1 $sexprs ...) } => {
    _sexpr (truthy $sexpr1) && _sexpr (and $sexprs ...)
  }
  rule { (and) } => {
    true
  }

  rule { (or $sexpr1 ) } => {
    _sexpr (truthy $sexpr1) 
  }
  rule { (or $sexpr1 $sexprs ...) } => {
    _sexpr (truthy $sexpr1) || _sexpr (or $sexprs ...)
  }
  rule { (or) } => {
    false
  }

  // reimplement by using scope more effectively and 
  // avoid the nested function defs
  rule { (letv [$k $v $rest ...] $sexprs ...) } => {
    (function ($k) {
      return (_sexpr (letv [$rest ...] $sexprs ...));
    })(_sexpr $v)
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

  rule { (def $n $sexpr) } => {
    _def $n $sexpr
  }

  // TODO: docstring
  rule { (defn $n [$args ...] $sexprs ...) } => {
    _sexpr (def $n (fn [$args ...] $sexprs ...))
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
  rule { ($ns/$f $args ...) } => {
    _fun($ns/$f)( _args($args ...))
  }
  rule { ($f $args ...) } => {
    _fun($f)( _args($args ...))
  }
  rule { $x } => { _x $x }
}

macro _return_sexprs {
  rule { ($sexpr) } => {
    return _sexpr $sexpr;
  }
  rule { ($sexpr $sexprs ...) } => {
    _sexpr $sexpr; _return_sexprs ($sexprs ...)
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

macro ki {
  case { _ require core} => {
    return #{
      _ki = {
        intern: function(obj) {
          for (var e in obj) {
            this[e] = obj[e];
          }
        },
        namespaces: {},
        modules: {
          core: {
            prn: console.log
          },
          mori: require('ki/node_modules/mori')
        }
      }; 
    }
  }
  case { _ require $module ... as $name} => {
    var module = #{$module ...};
    var module_name = '';
    module.forEach(function(e) { module_name += e.token.value; });
    letstx $module_name = [makeValue(module_name,#{$name})];
    return #{_ki.modules.$name = require($module_name)}
  }

  case { $ki (ns $ns $sexprs ...) } => {
    return #{ _sexpr (ns $ns $sexprs ...) }
  }

  case { $ki ($x ...) } => {
    // TODO: decide if the anonymous namespace
    // is persistent or volatile between ki forms
    return #{
      (function() { 
        if (_ki.namespaces._anon === undefined) {
          _ki.namespaces._anon = { vars: {} };
        }
        this['_ki_ns_name'] = '_anon';
        this['_ki_ns_ctx'] = this;
        _ki.intern.bind(this)(_ki.modules.core);
        _ki.intern.bind(this)(_ki.modules.mori);
        _ki.intern.bind(this)(_ki.namespaces[_ki_ns_name].vars);
        return (_sexpr ($x ...)); 
      })()
    }
  }
}

export ki;

