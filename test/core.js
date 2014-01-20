
var expect = require("expect.js");


describe("require core", function() {

  it("should create a _ki object", function() {
    ki require core
    expect(typeof _ki).to.not.eql('undefined')
  });

  it("should make mori available", function() {
    ki require core
    var mori = require("mori");
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
    ki (ns foo (def a 1));
    ki (ns bar (def a 2));
    expect(ki (identity a)).to.eql(0);
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
    ki (ns foo (use amodule bmodule));
    expect(
      ki (clj_to_js (ns foo (vector (bar) (baz))))
      ).to.eql([1,2]);
  });

});


