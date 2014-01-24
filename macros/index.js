/**
 * ki: a lisp for your JavaScript
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * Copyright (C) 2014 Luca Antiga http://lantiga.github.io
 */

macro _call {
  rule { ($el1.$el2.$el3.$el4.$el5.$el6 $els ...) } => {
    _sexpr $el1.$el2.$el3.$el4.$el5.$el6 (_els ($els ...))
  }
  rule { ($el1.$el2.$el3.$el4.$el5 $els ...) } => {
    _sexpr $el1.$el2.$el3.$el4.$el5 (_els ($els ...))
  }
  rule { ($el1.$el2.$el3.$el4 $els ...) } => {
    _sexpr $el1.$el2.$el3.$el4 (_els ($els ...))
  }
  rule { ($el1.$el2.$el3 $els ...) } => {
    _sexpr $el1.$el2.$el3 (_els ($els ...))
  }
  rule { ($el1.$el2 $els ...) } => {
    _sexpr $el1.$el2 (_els ($els ...))
  }
  rule { (:$el) } => {
    _x :$el
  }
  rule { (:$el $el1) } => {
    _sexpr (get $el1 :$el)
  }
  rule { (:$el $el1 $el2) } => {
    _sexpr (get $el1 :$el $el2)
  }
  rule { ($ns/$el $els ...) } => {
    _sexpr _ki.namespaces.$ns.vars.$el (_els ($els ...))
  }
  rule { ($el $els ...) } => {
    _sexpr $el (_els ($els ...))
  }
}

macro _els {
  rule { () } => {
  }

  rule { ($el1.$el2.$el3.$el4.$el5.$el6) } => {
    _sexpr $el1.$el2.$el3.$el4.$el5.$el6
  }
  rule { ($el1.$el2.$el3.$el4.$el5) } => {
    _sexpr $el1.$el2.$el3.$el4.$el5
  }
  rule { ($el1.$el2.$el3.$el4) } => {
    _sexpr $el1.$el2.$el3.$el4
  }
  rule { ($el1.$el2.$el3) } => {
    _sexpr $el1.$el2.$el3
  }
  rule { ($el1.$el2) } => {
    _sexpr $el1.$el2
  }
  rule { (:$el) } => {
    _sexpr :$el
  }
  rule { ($ns/$el) } => {
    _sexpr _ki.namespaces.$ns.vars.$el
  }
  rule { ($el) } => {
    _sexpr $el
  }

  rule { ($el1.$el2.$el3.$el4.$el5.$el6 $els ...) } => {
    _sexpr $el1.$el2.$el3.$el4.$el5.$el6, _els ($els ...)
  }
  rule { ($el1.$el2.$el3.$el4.$el5 $els ...) } => {
    _sexpr $el1.$el2.$el3.$el4.$el5, _els ($els ...)
  }
  rule { ($el1.$el2.$el3.$el4 $els ...) } => {
    _sexpr $el1.$el2.$el3.$el4, _els ($els ...)
  }
  rule { ($el1.$el2.$el3 $els ...) } => {
    _sexpr $el1.$el2.$el3, _els ($els ...)
  }
  rule { ($el1.$el2 $els ...) } => {
    _sexpr $el1.$el2, _els ($els ...)
  }
  rule { (:$el $els ...) } => {
    _sexpr :$el, _els ($els ...)
  }
  rule { ($ns/$el $els ...) } => {
    _sexpr _ki.namespaces.$ns.vars.$el, _els ($els ...)
  }
  rule { ($el $els ...) } => {
    _sexpr $el, _els ($els ...)
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
  case { _ :$x} => {
    var kw = #{$x}[0].token.value;
    letstx $kw = [makeValue(kw,#{$x})];
    return #{keyword($kw)}
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
        this._ki_ns_name = $nsname;
        this._ki_ns_ctx = this;
        _ki.intern.bind(this)(_ki.modules.core);
        _ki.intern.bind(this)(_ki.modules.mori);
        _ki.intern.bind(this)(_ki.namespaces[_ki_ns_name].vars);
        _return_sexprs ($sexprs ...);
      })()
    }
  }
}

macro _def {
  case { _ $n $sexpr } => {
    var varname = unwrapSyntax(#{$n});
    letstx $varname = [makeValue(varname,#{$n})];
    return #{
      (function() {
        _ki_ns_ctx[$varname] = _sexpr $sexpr;
        _ki.namespaces[_ki_ns_name].vars.$n = _ki_ns_ctx[$varname]
      })()
    };
  }
}

macro _count {
  case { $m ($els(,) ...) } => {
    var n = #{$els ...}.length;
    letstx $n = [makeValue(n,#{$m})];
    return #{$n};
  }
}

macro _fnmap {
  rule { ([$els ...] $sexprs ...), $rest(,)... } => {
    _count ($els(,)...): _sexpr (fn [$els ...] $sexprs ...), _fnmap $rest(,)...
  }
  rule { ([$els ...] $sexprs ...) } => {
    _count ($els(,)...): _sexpr (fn [$els ...] $sexprs ...)
  }
}

macro _loop_letv {
  rule { ([$k $v $rest ...] $i $vals $sexprs ...) } => {
    (function ($k) {
      return _loop_letv ([$rest ...] ($i+1) $vals $sexprs ...);
    })($vals === undefined ? $v : $vals[$i])
  }
  rule { ([] $i $vals $sexprs ...) } => {
    (function () {
      _return_sexprs ($sexprs ...)
    })()
  }
}
macro _loop {
  rule { [$kv ...] $sexprs ... } => {
    (function() {
      var res = {};
      do {
        res = _loop_letv ([$kv ...] 0 (res._ki_vals) $sexprs ...);
      }
      while ((res || 0)._ki_recur);
      return res;
    })()
  }
}

macro _sexpr {

  rule { () } => { 
  }
  
  rule { (ns $ns $sexprs ...) } => {
    _ns $ns $sexprs ...
  }

  rule { (use ) } => {
  }
  rule { (use $module $modules ...) } => {
    (function () {
      _ki.intern.bind(_ki_ns_ctx)(_ki.modules.$module);
      _sexpr (use $modules ...);
    })()
  }

  rule { (fn [$els ...] $sexprs ...) } => {
    function ($els(,)...) {
      if (arguments.length != _count($els(,)...)) {
        throw "Wrong number of args (" + arguments.length + ")."
      }
      _return_sexprs ($sexprs ...)
    }
  }

  rule { (fn $sexprs ...) } => {
    (function () {
      var fnmap = {_fnmap $sexprs(,) ...};
      return function () {
        var f = fnmap[arguments.length];
        if (f === undefined) {
          throw "Wrong number of args (" + arguments.length + ")."
        }
        return f.apply(this,arguments);
      }
    })()
  }

  rule { (truthy $sexpr) } => {
    (function (v) {
      return v === false || v == null ? false : true;
    })(_sexpr $sexpr)
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
    (function() {
      if (_sexpr (truthy $cond)) {
        return _sexpr $sthen;
      }
      return _sexpr $selse;
    })()
  }

  rule { (when $cond $sthen) } => {
    (function() {
      if (_sexpr (truthy $cond)) {
        return _sexpr $sthen;
      }
      return;
    })()
  }

  rule { (cond $cond1 $body1 $rest ...) } => {
    (function() {
      if (_sexpr (truthy $cond1)) {
        return _sexpr $body1;
      }
      return _sexpr (cond $rest ...);
    })()
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

  // FIXME: $v cannot be in js object property access notation
  // at least until we solve the sweet.js issue
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

  rule { (while $cond $sexpr) } => {
    (function () {
      while (_sexpr (truthy $cond)) {
        _sexpr $sexpr;
      }
    })()
  }

  rule { (loop $kvs $sexprs ...) } => {
    _loop $kvs $sexprs ...
  }

  rule { (recur $els ...) } => {
    //(function () {
    //  var vals = _els ($els ...);
    //  return {_ki_recur: true, _ki_vals: vals};
    //})()
    {_ki_recur: true, _ki_vals: [_els ($els ...)]}
  }

  rule { (def $n $sexpr) } => {
    _def $n $sexpr
  }

  // TODO: docstring
  rule { (defn $n [$els ...] $sexprs ...) } => {
    _sexpr (def $n (fn [$els ...] $sexprs ...))
  }
 
  rule { (defn $n ([$els ...] $sexprs ...) $rest ...) } => {
    _sexpr (def $n (fn ([$els ...] $sexprs ...) $rest ...))
  }
  
  // TODO
  //rule { (threadf $els ...) } => {
  //}

  // TODO
  //rule { (threadl $els ...) } => {
  //}

  rule { (prn $els ...) } => {
    console.log(_els ($els ...))
  }

  rule { (str $els ...) } => {
    (function() {
      return String.prototype.concat(_els ($els ...))
    })()
  }

  rule { (js $body ...) } => {
    $body ...
  }

  rule { ($els ...) } => {
    _call ($els ...)
  }

  rule { [$els ...] } => {
    _sexpr (vector $els ...)
  }

  rule { {$els ...} } => {
    _sexpr (hash_map $els ...)
  }

  rule { ns/:$x } => { _x ns/:$x }

  rule { :$x } => { _x :$x }

  rule { $x } => { _x $x }
}

macro _return_sexprs {
  rule { ($sexpr) } => {
    return _sexpr $sexpr
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
    return #{ 
      (function() {
        return _sexpr (ns $ns $sexprs ...) 
      })()
    }
  }

  case { $ki ($x ...) } => {
    // TODO: decide if the anonymous namespace
    // is persistent or volatile between ki forms
    return #{
      (function() { 
        if (_ki.namespaces._anon === undefined) {
          _ki.namespaces._anon = { vars: {} };
        }
        this._ki_ns_name = '_anon';
        this._ki_ns_ctx = this;
        _ki.intern.bind(this)(_ki.modules.core);
        _ki.intern.bind(this)(_ki.modules.mori);
        _ki.intern.bind(this)(_ki.namespaces[_ki_ns_name].vars);
        return (_sexpr ($x ...)); 
      })()
    }
  }
}

export ki;

