
ki require core

var foo = ki (vector 1 2 3)
console.log(
ki (conj foo 4)
)
// => [1 2 3 4]

console.log(
ki (map (fn [a] (inc a)) (range 5))
)
// => (1 2 3 4 5)

var fn1 = ki (js function (a,b) { return a + b + 2; })

var fn2 = ki (fn [a b] (js a + b + 2))

function somefunc (a) {
  ki (clj_to_js (filter (fn [el] (is_even el)) (range a))).forEach(function(el) { 
    console.log(el);
  });
  return [0, 1, 2, 3, 4].filter(ki (fn [el] (is_even el)));
}
console.log(somefunc(5));

console.log(
ki (take 6 (map (fn [x] (js x * 2)) (range 1000)))
)
// => (0 2 4 6 8 10)

function dont_execute () {
  ki require React/foobar as React
  ki (React.DOM.p 2 2 "ASD")
    //
    var foo = ki (React.DOM.p 2 (js this.props.foobar))
    // TODO: allow
    var foo = ki (React.DOM.p 2 this.props.foobar)

    ki ((js foo.bar) 1 (js this.props))
    ki ((js baz.bar) 1 this.props)

    console.log(foo);
}

var fiz = {baz: function(x, y) { return [2 * x, y] }}
var foo = {bar: "baz"};

console.log(
ki ((js fiz.baz) 2 (js foo.bar))
)

var a = "asdasd";
console.log(
ki (identity a.length)
)

console.log(
ki (fiz.baz 2 foo.bar)
)

console.log(
ki (if (js 1 > 10) 1 2)
);

console.log(
ki (when (js 1 > 10) 1)
);

console.log(
ki (when (js 10 > 1) (inc 2))
)

console.log(
ki (cond (js 1 > 10) 1 (js 10 > 1) 10)
)

console.log(
ki (cond (js 1 > 0) 1)
)

var a = 100;
console.log(
ki (letv [a 1 b 2] (prn "foo") (js a + b))
)

console.log(
ki (do
    (letv [a 1 b 2] (prn a b))
    (letv [a 3 b 5] (prn a b) (js a + b)))
)

console.log(
ki (and 0 2 3)
)

console.log(
ki (or 0 2 3)
)

