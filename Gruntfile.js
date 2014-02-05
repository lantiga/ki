module.exports = function(grunt) {
  grunt.initConfig({
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: 'test/**/*.out.js'
      }
    }
  });

  grunt.registerTask('build', function() {
    //var macro = '';
    //var files = ['ki.sjs','react.sjs','core.sjs'];
    //files.forEach(function(f) { macro += grunt.file.read('./src/' + f) + '\n'; });
    // TODO: add filenames of macro files as arguments
    var macro = grunt.file.read('./src/ki.sjs');
    grunt.file.write('./macros/index.js', macro);
  });

  grunt.registerTask('build-test', function() {
    var path = require('path');
    var files = ['./test/core.js'];
    files.forEach(function(f) {
      grunt.file.write(f.replace('.js', '.out.js'), compileFile(f, true));
    });
  });

  grunt.registerTask('compile', function(fileName) {
    grunt.log.write(compileFile(fileName));
  });

  var moduleCtx;

  function compileFile(fileName, isTest) {
    var macro = grunt.file.read('./macros/index.js');
    var file  = grunt.file.read(fileName);
    var sweet = require('sweet.js');

    if (!moduleCtx) moduleCtx = sweet.loadModule(macro);

    return sweet.compile(file, {
      modules: [moduleCtx]
    }).code;
  }

  grunt.registerTask('default', ['build']);
  grunt.registerTask('test', ['build', 'build-test', 'mochaTest']);
  grunt.loadNpmTasks('grunt-mocha-test');
};


