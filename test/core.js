
var expect = require("expect.js");


describe("require core", function() {

  it("should create a _ki object", function() {
    ki require core
    expect(typeof _ki).to.not.eql('undefined')
  });

  it("should make mori available", function() {
    ki require core
    var mori = _ki.modules.mori;
    expect(ki (vector 1 2 3)).to.eql(mori.vector(1,2,3))
  });

});

describe("sexpressions", function() {

  it("should allow to call js functions", function() {
    ki require core
    var f0 = function() { return 1; }
    var f1 = function(a) { return a; }
    var f2 = function(a, b) { return [a, b]; }
    expect(ki (f0)).to.eql(1);
    expect(ki (f1 1)).to.eql(1);
    expect(ki (f2 1 2)).to.eql([1,2]);
  });

  it("should allow to use attribute access notation as function name", function() {
    ki require core
    var foo0 = { bar: function() { return 1; } }
    var foo1 = { bar: function(a) { return a; } }
    var foo2 = { bar: function(a,b) { return [a, b]; } }
    var goo0 = { bar: { baz : function() { return 1; } } }
    var goo1 = { bar: { baz : function(a) { return a; } } }
    var goo2 = { bar: { baz : function(a, b) { return [a, b]; } } }
    expect(ki (foo0.bar)).to.eql(1);
    expect(ki (foo1.bar 1)).to.eql(1);
    expect(ki (foo2.bar 1 2)).to.eql([1,2]);
    expect(ki (goo0.bar.baz)).to.eql(1);
    expect(ki (goo1.bar.baz 1)).to.eql(1);
    expect(ki (goo2.bar.baz 1 2)).to.eql([1,2]);
  });

  it("should allow to use attribute access notation as function argument", function() {
    ki require core
    var goo1 = { bar: { baz : function(a) { return a; } } }
    var goo2 = { bar: { baz : function(a, b) { return [a, b]; } } }
    var goo3 = { bar: { baz : function(a, b, c) { return [a, b, c]; } } }
    var data = { a: { b: 0 }}
    expect(ki (goo1.bar.baz data.a.b)).to.eql(0);
    expect(ki (goo2.bar.baz data.a.b 1)).to.eql([0,1]);
    expect(ki (goo3.bar.baz data.a.b 1 data.a.b)).to.eql([0,1,0]);
  });

  it("should allow to call mori functions on mori data structures", function() {
    ki require core
    var foo = ki (vector 1 2 3)
    expect(ki (conj foo 4)).to.eql(ki (vector 1 2 3 4));
  });

});

describe("lambdas", function() {

  it("should allow to define anonymous functions and call them from js", function() {
    ki require core
    var f = ki (fn [x] (sum x 1))
    expect(f(1)).to.eql(2);
  });

  // TODO: test arity check

  it("should allow to define anonymous functions and use them in ki", function() {
    ki require core
    expect(
      ki (clj_to_js (map (fn [x] (sum x 1)) (vector 1 2 3)))
      ).to.eql([2,3,4]);
  });

});

describe("interoperability", function() {

  it("should allow to call js within ki", function() {
    ki require core
    expect(
      ki (clj_to_js (map (js function(x) { return x + 1; }) (vector 1 2 3)))
      ).to.eql([2,3,4]);
  });

  it("should allow to pass a ki fn as a js callback", function() {
    ki require core
    expect(
      [1,2,3,4].map(ki (fn [x _ _] (is_even x)))).to.eql([false,true,false,true]);
  });

});

describe("local bindings and lexical scope", function() {

  it("should allow to define local bindings in a letv form and ensure proper lexical scope", function() {
    ki require core
    expect(
      ki (clj_to_js
           (letv [a 1 
                  b 2]
              (vector a b)))
      ).to.eql([1,2]);
    expect(
      ki (clj_to_js
           (letv [a 0]
            (letv [a 1 
                   b 2]
               (vector a b))))
      ).to.eql([1,2]);
    expect(
      ki (clj_to_js
           (letv [a 1
                  b 2]
            (letv [a 3 
                   b 4] 
              a)
            (vector a b)))
      ).to.eql([1,2]);
  });

});

describe("namespaces", function() {

  it("should allow to define multiple namespaces and an anonymous namespace", function() {
    ki require core
    ki (def a 0);
    ki (defn b [x] x);
    ki (ns foo (def a 1));
    ki (ns bar (def a 2));
    expect(ki (identity a)).to.eql(0);
    expect(ki (b 0)).to.eql(0);
    expect(ki (ns foo a)).to.eql(1);
    expect(ki (ns bar a)).to.eql(2);
  });

  it("should allow to use fully qualified identifiers", function() {
    ki require core
    ki (def a 0);
    ki (ns foo (def a 1));
    ki (ns bar (def a 2));
    expect(
      ki (clj_to_js (vector a foo/a bar/a))
      ).to.eql([0,1,2]);
  });

  it("should allow to intern modules", function() {
    ki require core
    _ki.modules['amodule'] = { bar: function() { return 1; }};
    _ki.modules['bmodule'] = { baz: function() { return 2; }};
    ki (ns foo 
        (use amodule bmodule));
    expect(
      ki (clj_to_js (ns foo (vector (bar) (baz))))
      ).to.eql([1,2]);
  });

});

describe("truthiness", function() {

  it("should have truthy return false only for boolean false, nil (and js null and undefined)", function() {
    ki require core
    expect(ki (truthy false)).to.eql(false);
    expect(ki (truthy nil)).to.eql(false);
    expect(ki (truthy (js null))).to.eql(false);
    expect(ki (truthy (js undefined))).to.eql(false);
    expect(ki (truthy "")).to.eql(true);
    expect(ki (truthy 0)).to.eql(true);
    expect(ki (falsey false)).to.eql(true);
    expect(ki (falsey 0)).to.eql(false);
    expect(ki (not (falsey false))).to.eql(false);
    expect(ki (not (falsey 0))).to.eql(true);
  });

});

describe("logical operators", function() {

  it("should be consistent with definition of truthiness", function() {
    ki require core
    expect(ki (and "" 0)).to.eql(true);
    expect(ki (and "" 0 nil)).to.eql(false);
    expect(ki (or "" 0)).to.eql(true);
    expect(ki (or false nil)).to.eql(false);
    expect(ki (and "" (not (or false nil)) 0)).to.eql(true);
  });

  it("should short circuit", function() {
    ki require core
    expect(ki (and true false undefined_symbol)).to.eql(false);
    expect(ki (or false true undefined_symbol)).to.eql(true);
  });
});

describe("equality", function() {

  it("should operate on deep data structures", function() {
    ki require core
    expect(ki (eq {"a" 1 "b" [{"c" 1} 2]} {"a" 1 "b" [{"c" 1} 2]})).to.eql(true);
    expect(ki (eq {"a" 1 "b" [{"c" 3} 2]} {"a" 1 "b" [{"c" 1} 2]})).to.eql(false);
    expect(ki (neq {"a" 1 "b" [{"c" 3} 2]} {"a" 1 "b" [{"c" 1} 2]})).to.eql(true);
  });

});

describe("flow control", function() {

  it("should allow branching consistently with definition of truthiness", function() {
    ki require core
    expect(ki (when (eq 1 1) "foo")).to.eql("foo");
    expect(ki (if "" "foo" "bar")).to.eql("foo");
    expect(ki (if 0 "foo" "bar")).to.eql("foo");
    expect(ki (if nil "foo" "bar")).to.eql("bar");
  });

  it("should have cond be consistent with definition of truthiness", function() {
    ki require core
    expect(ki (cond
                (eq 1 2) "foo"
                nil "bar"
                "" "baz")).to.eql("baz");
  });

  it("should have cond short circuit", function() {
    ki require core
    expect(ki (cond
                (eq 1 2) "foo"
                true "bar"
                undefined_symbol "baz")).to.eql("bar");
  });

});

describe("data literals", function() {

  it("should allow to create vectors", function() {
    ki require core
    expect(ki (eq [1 2 3 4] (vector 1 2 3 4))).to.eql(true);
  });

  it("should allow to create hash maps", function() {
    ki require core
    expect(ki (eq {"a" 2 "b" 4} (hash_map "a" 2 "b" 4))).to.eql(true);
  });

  it("should allow to create deeply nested data structures", function() {
    ki require core
    expect(ki (eq {"a" [2 [3 4]] "b" {"c" 5 [6 7] "d"}} 
                (hash_map "a" (vector 2 (vector 3 4)) 
                          "b" (hash_map "c" 5 (vector 6 7) "d")))).to.eql(true);
  });

});

describe("recursion", function() {

  it("should allow to express simple recursion", function() {
    ki require core
    ki (defn fib [n]
        (cond 
         (eq n 0) 0
         (eq n 1) 1
         "else" (sum (fib (js n-1)) (fib (js n-2)))));
    expect(ki (fib 20)).to.eql(6765);
  });

  it("should allow to recur using loop/recur without blowing the stack", function() {
    ki require core
    ki (defn fib [n]
        (loop [a 0 b 1 iter 0]
         (if (js iter == n) a
          (recur b (js a + b) (inc iter)))));
    expect(ki (fib 20)).to.eql(6765);
    expect(ki (fib 500)).to.eql(1.394232245616977e+104);
  });

});

describe("keywords", function() {

  it("should be usable in collections", function() {
    ki require core
    var mori = _ki.modules.mori;
    expect(ki ([:a 1 :b {:c 2}])).to.eql(
      mori.vector(mori.keyword('a'),1,
        mori.keyword('b'),mori.hash_map(mori.keyword('c'),2)));
  });

  it("should evaluate to themselves", function() {
    ki require core
    var mori = _ki.modules.mori;
    expect(ki (do (:a))).to.eql(mori.keyword('a'));
  });

  it("should evaluate as keys to get values from collections", function() {
    ki require core
    var mori = _ki.modules.mori;
    expect(ki (:a {:a 1 :b 2})).to.eql(1);
  });

});

describe("arity", function() {

  it("should throw when a function is called with incorrect arity", function() {
  });

  it("should allow to define functions with multiple arities", function() {
  });

  it("should throw when a multiple arity function is called with incorrect arity", function() {
  });

  it("should allow to define functions with optional arguments", function() {
    // TODO
  });

  it("should throw if functions with optional arguments are called with insufficient arguments", function() {
    // TODO
  });

});

describe("threading", function() {
  // TODO
});

describe("math operations", function() {
  // TODO
});

describe("continuations", function() {
  // TODO
});

describe("misc", function() {

  it("should allow to concatenate strings and literals", function() {
    ki require core
    expect(ki (str "a" 2 "b" 3 "c")).to.eql("a2b3c");
  });

});

