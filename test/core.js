
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
      [1,2,3,4].map(ki (fn [x] (is_even x)))).to.eql([false,true,false,true]);
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
            (letv [a (inc a) 
                   b (inc a)]
               (vector a b))))
      ).to.eql([1,2]);
    var c = {d: 1};
    var mori = _ki.modules.mori;
    expect(
      ki (letv [a c.d
                b (inc a)
                e :e]
            (letv [a (inc a) 
                   b (inc b)] 
              a)
            (vector a b e))
      ).to.eql(mori.vector(1,2,mori.keyword('e')));
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
    expect(
      ki (cond
           (eq 1 2) "foo"
           nil "bar"
           "" "baz")).to.eql("baz");
    expect(
      ki (cond
           (eq 1 2) "foo"
           nil "bar"
           :else "baz")).to.eql("baz");
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

  it("should allow to create hash maps and evaluate forms", function() {
    ki require core
    expect(ki (eq {"a" (inc 1) (str "b") 4} (hash_map "a" 2 "b" 4))).to.eql(true);
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
        (loop [a 0 b (inc a) iter 0]
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
    expect(ki (do [:a 1 :b {:c 2}])).to.eql(
      mori.vector(mori.keyword('a'),1,
        mori.keyword('b'),mori.hash_map(mori.keyword('c'),2)));
  });

  //it("should evaluate to themselves", function() {
  //  ki require core
  //  var mori = _ki.modules.mori;
  //  expect(ki (do (:a))).to.eql(mori.keyword('a'));
  //});

  //it("should evaluate as keys to get values from collections", function() {
  //  ki require core
  //  var mori = _ki.modules.mori;
  //  expect(ki (:a {:a 1 :b 2})).to.eql(1);
  //});

});

describe("arity", function() {

  it("should allow calling functions without arity constraints, as in js", function() {
    ki require core
    ki (defn foo [a] (str "Hello " a))
    expect(
      ki (foo 1 2)
      ).to.eql("Hello 1");
    expect(
      ki (foo)
      ).to.eql("Hello undefined");
  });

  it("should allow to define functions with multiple arities", function() {
    ki require core
    ki (defn foo 
         ([a] (str "Hello " a))
         ([a b] (str "There " a " " b)))
    expect(
      ki (foo 1)
      ).to.eql("Hello 1");
    expect(
      ki (foo 1 2)
      ).to.eql("There 1 2");
  });

  it("should fallback to max arity in case supplied arguments do not match the specified arities", function() {
    ki require core
    ki (defn foo 
         ([a] (str "Hello " a))
         ([a b] (str "There " a " " b)))
    expect(
      ki (foo)
      ).to.eql("There undefined undefined");
    expect(
      ki (foo 1 2 3)
      ).to.eql("There 1 2");
  });

  //it("should allow to define functions with optional arguments", function() {
  //  throw "Not implemented"
  //});

});

describe("chaining and doto", function() {

  it("should allow to use JavaScript chained APIs", function() {
    ki require core
    var A = function() {
      var self = this;
      this.v = "init ";
      this.foo = function(x) {
        self.v += "foo called with " + x + " ";
        return self;
      };
      this.bar = function(x) {
        self.v += "bar called with " + x + " ";
        return self;
      };
    }
    var a = new A();
    var mori = _ki.modules.mori;
    expect(
      ki (chain a (foo 1) (bar 2) v)
      ).to.eql('init foo called with 1 bar called with 2 ');
  });

  it("should allow to repeatedly call methods on a JavaScript object", function() {
    ki require core
    var A = function() {
      var self = this;
      this.foo = null;
      this.bar = null;
      this.setFoo = function(x) {
        self.foo = x;
      };
      this.setBar = function(x) {
        self.bar = x;
      };
      this.getFooBar = function() {
        return self.foo + " " + self.bar;
      }
    }
    var a = new A();
    var mori = _ki.modules.mori;
    expect(
      ki (doto a (setFoo 'a') (setBar 'b')).getFooBar()
      ).to.eql('a b');
  });

});

describe("threading", function() {

  it("should allow to thread first a value through a sequence of computations", function() {
    ki require core
    var a = 1;
    expect(
      ki (threadf a inc inc dec)
      ).to.eql(2);
    expect(
      ki (threadf a (sum 2) (sum 3))
      ).to.eql(6);
    expect(
      ki (threadf [] (conj 1) first)
      ).to.eql(1);
  });

  it("should allow to thread last a value through a sequence of computations", function() {
    ki require core
    var a = 1;
    expect(
      ki (threadl a (conj []) (map (fn [x] (inc x))) first)
      ).to.eql(2);
  });

});

describe("math operations", function() {

  it("should allow to add, subtract, multiply, divide a sequence of numbers and compute the modulo of two numbers", function() {
    ki require core
    expect(ki (add 1 2 3)).to.eql(6);
    expect(ki (sub 3 2 1)).to.eql(0);
    expect(ki (mul 1 2 3)).to.eql(6);
    expect(ki (div 3 2 1)).to.eql(1.5);
    expect(ki (mod 3 2)).to.eql(1);
  });

  it("should allow to compare sequences of numbers", function() {
    ki require core
    expect(ki (lt 1 2 3)).to.eql(true);
    expect(ki (lt 3 2 1)).to.eql(false);
    expect(ki (lt 1 2 2)).to.eql(false);
    expect(ki (gt 1 2 3)).to.eql(false);
    expect(ki (gt 3 2 1)).to.eql(true);
    expect(ki (gt 3 2 2)).to.eql(false);
    expect(ki (leq 1 2 3)).to.eql(true);
    expect(ki (leq 3 2 1)).to.eql(false);
    expect(ki (leq 1 2 2)).to.eql(true);
    expect(ki (geq 1 2 3)).to.eql(false);
    expect(ki (geq 3 2 1)).to.eql(true);
    expect(ki (geq 3 2 2)).to.eql(true);
  });

});

describe("continuations", function() {
  
  it("should allow to write asynchronous code in a synchronous fashion", function() {
    ki require core
    var foo = function(x, cb) {
      var y = x * 2;
      cb(y);
    };
    var bar = function(x, cb) {
      var y = x + 1;
      cb(y);
    };
    var baz = function(x, cb) {
      var y = x + 1;
      var z = x * 2;
      cb(y,z);
    };

    ki (letc [a (foo 2)
              b (bar a)
              [c d] (baz b)]
        (js expect(b).to.eql(5))
        (js expect(c).to.eql(6))
        (js expect(d).to.eql(10)))

    ki require core
    var log = "";
    ki (do
        (defn fake_request [url cb]
         (setTimeout (fn [] (cb 1234)) 1000))
        
        (letc [data (fake_request "fakeurl")]
         (js log += "Response received: " + data + ".")
         (js expect(log).to.eql("Request sent. Response received: 1234.")))

        (js log += "Request sent. "))
    expect(log).to.eql("Request sent. ");
  });

});

describe("apply", function() {

  it("should call a function given a list of arguments supplied as a collection", function() {
    ki require core
    var mori = _ki.modules.mori;
    expect(
      ki (apply list [1 2 3 4])
      ).to.eql(mori.list(1,2,3,4));
  });

});

describe("bind", function() {

  it("should return a function with this set to the provided object", function() {
    ki require core
    ki (do 
        (def a {:a 1 :b 2})
        (defn f [] (get this :a)))
    expect(ki ((bind f a))).to.eql(1);
    expect(ki ((bind (fn [] (get this :a)) a))).to.eql(1);
  });

});

describe("multimethods", function() {

  it("should allow to define functions that dispatch according to the result of the evaluation of another function", function() {
    ki require core
    ki (do
        (defmulti boss (fn [x] (get x :type)))
        (defmethod boss :employee [x] (get x :employer))
        (defmethod boss :employer [x] (get x :name)));
    expect(ki (boss {:type :employee :name "Barnie" :employer "Fred"})).to.eql("Fred");
    expect(ki (boss {:type :employer :name "Fred"})).to.eql("Fred");
  });

});

describe("str", function() {

  it("should allow to concatenate strings and literals", function() {
    ki require core
    expect(ki (str "a" 2 "b" 3 "c")).to.eql("a2b3c");
  });

});

