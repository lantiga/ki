/**
 * ki: a lisp for your JavaScript
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * Copyright (C) 2014 Luca Antiga http://lantiga.github.io
 */

macro _args {
  rule { () } => {
  }

  rule { ($arg) } => {
    _sexpr $arg
  }

  rule { ($arg $args ...) } => {
    _sexpr $arg, _args ($args ...)
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
        _ki.init(this,$nsname);
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
  case { $m ($x(,) ...) } => {
    var n = #{$x ...}.length;
    letstx $n = [makeValue(n,#{$m})];
    return #{$n};
  }
}

macro _fnmap {
  rule { ([$args ...] $sexprs ...), $rest(,)... } => {
    _count ($args(,)...): _sexpr (fn [$args ...] $sexprs ...), _fnmap $rest(,)...
  }
  rule { ([$args ...] $sexprs ...) } => {
    _count ($args(,)...): _sexpr (fn [$args ...] $sexprs ...)
  }
}

macro _letv {
  rule { ([$k $v $rest ...] $sexprs ...) } => {
    return (function($k) {
      _letv ([$rest ...] $sexprs ...)
    })(_sexpr $v);
  }
  rule { ([] $sexprs ...) } => {
    _return_sexprs ($sexprs ...)
  }
}

macro _letc {
  rule { ([[$ks ...] ($fn ...)] $sexprs ...) } => {
    _sexpr ($fn ... (fn [$ks ...] $sexprs ... nil))
  }
  rule { ([$k ($fn ...)] $sexprs ...) } => {
    _sexpr ($fn ... (fn [$k] $sexprs ... nil))
  }
  rule { ([[$ks ...] ($fn ...) $rest ...] $sexprs ...) } => {
    _sexpr ($fn ... (fn [$ks ...] 
                     (letc [$rest ...] $sexprs ...) nil))
  }
  rule { ([$k ($fn ...) $rest ...] $sexprs ...) } => {
    _sexpr ($fn ... (fn [$k] 
                     (letc [$rest ...] $sexprs ...) nil))
  }
}

macro _loop_letv {
  rule { ([$k $v $rest ...] $i $vals $sexprs ...) } => {
    return (function($k) {
      _loop_letv ([$rest ...] ($i+1) $vals $sexprs ...)
    })($vals === undefined ? _sexpr $v : $vals[$i]);
  }
  rule { ([] $i $vals $sexprs ...) } => {
    _return_sexprs ($sexprs ...)
  }
}

macro _chain {
  rule { (($method $args ...)) } => {
    .$method(_args ($args ...))
  }
  rule { ($property) } => {
    .$property
  }
  rule { (($method $args ...) $rest ...) } => {
    .$method(_args ($args ...)) _chain ($rest ...)
  }
  rule { ($property $rest ...) } => {
    .$property _chain ($rest ...)
  }
}

macro _doto {
  rule { ($obj ($method $args ...)) } => {
    $obj.$method(_args ($args ...));
  }
  rule { ($obj ($method $args ...) $rest ...) } => {
    $obj.$method(_args ($args ...));
    _doto ($obj $rest ...)
  }
}

macro _interpose_op {
  rule { $op ($arg) } => {
    _sexpr $arg
  }
  rule { $op ($arg $args ...) } => {
    _sexpr $arg $op _interpose_op $op ($args ...)
  }
}

macro _compare {
  rule { $op ($arg) } => {
    true
  }
  rule { $op ($arg1 $arg2) } => {
    $arg1 $op $arg2
  }
  rule { $op ($arg1 $arg2 $args ...) } => {
    _sexpr $arg1 $op $arg2 && _compare $op ($arg2 $args ...)
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

  rule { (ns_get $ns $x) } => {
    _sexpr _ki.namespaces.$ns.vars.$x
  }

  rule { (js $body ...) } => {
    $body ...
  }

  rule { (fn [$args ...] $sexprs ...) } => {
    function ($args(,)...) {
      _return_sexprs ($sexprs ...)
    }
  }

  rule { (fn $sexprs ...) } => {
    (function () {
      var fnmap = {_fnmap $sexprs(,) ...};
      var max_arity = 0;
      for (var a in fnmap) {
        max_arity = a > max_arity ? a : max_arity;
      }
      fnmap[null] = fnmap[max_arity];
      return function () {
        var f = fnmap[arguments.length] || fnmap[null];
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

  rule { (eq $sexprs ...) } => {
    _sexpr (equals $sexprs ...)
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

  rule { (and $sexpr) } => {
    _sexpr (truthy $sexpr)
  }
  rule { (and $sexpr $sexprs ...) } => {
    _sexpr (truthy $sexpr) && _sexpr (and $sexprs ...)
  }

  rule { (or $sexpr) } => {
    _sexpr (truthy $sexpr)
  }
  rule { (or $sexpr $sexprs ...) } => {
    _sexpr (truthy $sexpr) || _sexpr (or $sexprs ...)
  }

  rule { (letv [$bindings ...] $sexprs ...) } => {
    (function() {
      _letv ([$bindings ...] $sexprs ...)
    })()
  }

  rule { (letc [$bindings ...] $sexprs ...) } => {
    _letc ([$bindings ...] $sexprs ...)
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

  rule { (loop [$bindings ...] $sexprs ...) } => {
    (function() {
      var res = {};
      do {
        res = (function() {
          _loop_letv ([$bindings ...] 0 (res._ki_vals) $sexprs ...);
        })();
      }
      while ((res || 0)._ki_recur);
      return res;
    })()
  }

  rule { (recur $args ...) } => {
    {_ki_recur: true, _ki_vals: [_args ($args ...)]}
  }

  rule { (def $n $sexpr) } => {
    _def $n $sexpr
  }

  // TODO: docstring
  rule { (defn $n [$args ...] $sexprs ...) } => {
    _sexpr (def $n (fn [$args ...] $sexprs ...))
  }
 
  rule { (defn $n ([$args ...] $sexprs ...) $rest ...) } => {
    _sexpr (def $n (fn ([$args ...] $sexprs ...) $rest ...))
  }
 
  rule { (threadf $v ($fn $args ...)) } => {
    _sexpr ($fn $v $args ...)
  }
  rule { (threadf $v ($fn $args ...) $x ...) } => {
    _sexpr (threadf ($fn $v $args ...) $x ...)
  }
  rule { (threadf $v $el) } => {
    _sexpr ($el $v)
  }
  rule { (threadf $v $el $x ...) } => {
    _sexpr (threadf ($el $v) $x ...)
  }

  rule { (threadl $v ($fn $args ...)) } => {
    _sexpr ($fn $args ... $v)
  }
  rule { (threadl $v ($fn $args ...) $x ...) } => {
    _sexpr (threadl ($fn $args ... $v) $x ...)
  }
  rule { (threadl $v $el) } => {
    _sexpr ($el $v)
  }
  rule { (threadl $v $el $x ...) } => {
    _sexpr (threadl ($el $v) $x ...)
  }

  rule { (chain $obj $rest ...) } => {
    $obj _chain ($rest ...)
  }

  rule { (doto $obj $rest ...) } => {
    (function() {
      _doto ($obj $rest ...)
      return $obj;
    })()
  }

  rule { (add $args ...) } => {
    _interpose_op + ($args ...)
  }

  rule { (sub $args ...) } => {
    _interpose_op - ($args ...)
  }

  rule { (mul $args ...) } => {
    _interpose_op * ($args ...)
  }

  rule { (div $args ...) } => {
    _interpose_op / ($args ...)
  }

  rule { (mod $num $div) } => {
    _sexpr (js $num % $div)
  }

  rule { (lt $args ...) } => {
    _compare < ($args ...)
  }
  rule { (gt $args ...) } => {
    _compare > ($args ...)
  }
  rule { (leq $args ...) } => {
    _compare <= ($args ...)
  }
  rule { (geq $args ...) } => {
    _compare >= ($args ...)
  }

  rule { (prn $args ...) } => {
    console.log(_args ($args ...))
  }

  rule { (str $args ...) } => {
    (function() {
      return String.prototype.concat(_args ($args ...))
    })()
  }

  rule { ($fn $args ...) } => {
    _sexpr $fn (_args ($args ...))
  }

  rule { [$x ...] } => {
    _sexpr (vector $x ...)
  }

  rule { {$x ...} } => {
    _sexpr (hash_map $x ...)
  }

  rule { $x } => { 
    _x $x
  }

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
        init: function(self, ns_name) {
          if (_ki.namespaces[ns_name] === undefined) {
            _ki.namespaces[ns_name] = { vars: {} };
          }
          self._ki_ns_name = ns_name;
          self._ki_ns_ctx = self;
          _ki.intern.bind(self)(_ki.modules.core);
          _ki.intern.bind(self)(_ki.modules.mori);
          _ki.intern.bind(self)(_ki.namespaces[_ki_ns_name].vars);
        },
        intern: function(obj) {
          for (var e in obj) {
            this[e] = obj[e];
          }
        },
        namespaces: {},
        modules: {
          core: {
            truthy: function(v) {
              return v === false || v == null ? false : true;
            }
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

  case { $ki ($x ...) } => {
    
    var Token = {
      BooleanLiteral: 1,
      EOF: 2,
      Identifier: 3,
      Keyword: 4,
      NullLiteral: 5,
      NumericLiteral: 6,
      Punctuator: 7,
      StringLiteral: 8,
      RegularExpression: 9,
      Template: 10,
      Delimiter: 11
    }
    
    function transform(ki_ast, inner) {
      var content = inner.map(function(el) { return el; });
      if (content[0].token.type == Token.Punctuator && 
          content[0].token.value == ':') {
        content.shift();
        var name = content.shift();
        content.forEach(function(el,i) {
          name.token.value += el.token.value;
        });
        name.token.type = Token.StringLiteral;
        content = [{
          token: {
            type: Token.Identifier,
            value: 'keyword',
            lineNumber: inner[0].token.lineNumber,
            lineStart: inner[0].token.lineStart,
            range: inner[0].token.range},
          context: inner[0].context,
          deferredContext: inner[0].deferredContext},
          name];
        }
      else if (content.length == 3 && 
          content[1].token.type == Token.Punctuator && 
          content[1].token.value == '/') {
        content = [{
          token: {
            type: Token.Identifier,
            value: 'ns_get',
            lineNumber: inner[0].token.lineNumber,
            lineStart: inner[0].token.lineStart,
            range: inner[0].token.range},
          context: inner[0].context,
          deferredContext: inner[0].deferredContext},
          content[0], content[2]];
        }
      else {
        content.unshift({
          token: {
            type: Token.Identifier,
            value: 'js',
            lineNumber: inner[0].token.lineNumber,
            lineStart: inner[0].token.lineStart,
            range: inner[0].token.range},
          context: inner[0].context,
          deferredContext: inner[0].deferredContext});
      }
      ki_ast.push({
        token: {
          type: Token.Delimiter,
          value: '()',
          startLineNumber: inner[0].token.lineNumber,
          startLineStart: inner[0].token.lineStart,
          startRange: inner[0].token.range,
          inner: content,
          endLineNumber: inner[0].token.lineNumber,
          endLineStart: inner[0].token.lineStart,
          endRange: inner[0].token.range
        }
      });
    }
    
    function ast_js_to_ki(ast) {
    
      var ki_ast = [];
      var acc = [];
      var next = null;
    
      ast.forEach(function(el,i) {
    
        switch (el.token.type) {
          case Token.Punctuator:
            acc.push(el);
            break;
          case Token.Identifier:
          case Token.Keyword:
            next = ast[i+1];
            if (next === undefined || next.token.type != Token.Punctuator ||
                (next.token.type == Token.Punctuator && next.token.value == ':')) {
              if (acc.length == 0) {
                ki_ast.push(el);
              }
              else {
                acc.push(el);
                transform(ki_ast, acc);
                acc = [];
              }
            }
            else {
              acc.push(el);
            }
            break;
          case Token.Delimiter:
            // FIXME: here we're modifying el in place.
            // We should probably avoid it.
            if (!(el.token.inner.length > 0 && 
                  (el.token.inner[0].token.type == Token.Identifier &&
                   el.token.inner[0].token.value == 'js'))) {
                     el.token.inner = ast_js_to_ki(el.token.inner);
                   }
            ki_ast.push(el);
            break;
          default:
            ki_ast.push(el);
            break;
        }
      });
    
      return ki_ast;
    }

    var x = #{$x ...};
    var ki_x = ast_js_to_ki(x);
    letstx $ki_x ... = ki_x;

    return #{
      (function() { 
        _ki.init(this,'_ki');
        return (_sexpr ($ki_x ...)); 
      })()
    }
  }
}

export ki;

