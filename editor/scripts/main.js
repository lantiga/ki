
requirejs.config({
  shim: {
    'underscore': {
      exports: '_'
    },
    'jquery': {
      exports: '$'
    }
  }
});

require(['./ki','./mori','./jquery'], function(ki,mori,$) {
  $.get('/scripts/ki.sjs',function(ki_core) {
    var result = ki.compile('ki require core; var a = ki (range 1 10); console.log(ki (first a));',ki_core);
    eval(result.code);
  });
});

