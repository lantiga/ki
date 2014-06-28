
requirejs.config({
  shim: {
    'underscore': {
      exports: '_'
    }  
  }
});

require(['./ki','text!ki.sjs','./mori'], function(ki,ki_core,mori) {

  var result = ki.compile('ki require core; var a = ki (range 1 10); console.log(ki (first a));',{ki_core: ki_core});
  eval(result.code);

});

