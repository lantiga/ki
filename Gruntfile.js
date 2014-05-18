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

  //grunt.registerTask('compile', function(fileName) {
  //  console.log(this.data);
  //  grunt.log.write(compileFile(fileName));
  //});

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

  var parseMacros = function(code) {
    var re = /ki *macro/
    
    var current = code;
    var start = current.search(re);
    var ret;
    var macros = [];
    while (start != -1) {
      current = current.substr(start);
      ret = getNSExprs(current,2);
      macros.push(ret.matches);
      current = current.substr(ret.end);
      start = current.search(re);
    }
    
    var rules = macros.map(function(macro) { 
      return 'rule { ' + macro[0] + ' } => { _sexpr ' + macro[1] + ' }' 
    });

    return rules.join('\n');
  }

  grunt.registerTask('compile', function() {
  
    var path = require('path');
    var sweet = require('sweet.js');
    var uglify = require('uglify-js');

    var infile    = grunt.option('in');
    var outfile   = grunt.option('out');
    var sourcemap = grunt.option('sourcemap') || false;
    var minify    = grunt.option('minify') || false;
    var compress  = grunt.option('compress') || false;
  
    var file;
    if (infile) {
      file = grunt.file.read(infile);
    } 
    else if (argv._.length === 0) {
      console.log(require("optimist").help());
      return;
    }
  
    var ki_core = grunt.file.read('./macros/index.js');    

    var include = grunt.option('include');
    var includes = typeof include === 'string' ? [include] : include;
    var includeFiles = (includes || []).map(function(path) {
      return grunt.file.read(path);
    });
  
    var rules = includeFiles.map(function(includeFile) {
      return parseMacros(includeFile);
    });
    rules.push(parseMacros(file));
  
    var module = ki_core.replace('/*__macros__*/',rules.join('\n'));
  
    var options = {
      filename: infile,
      modules: [sweet.loadModule(module)]
    };
  
    var compile = function(file) {
      var file = includeFiles.join('\n') + file;
      if (sourcemap && outfile) {
        options.sourceMap = true;
        var result = sweet.compile(file, options);
        var mapfile = path.basename(outfile) + '.map';
        var code = result.code + '\n//# sourceMappingURL=' + mapfile;
        var sourceMap = result.sourceMap;
        var mapfile = outfile + '.map';
        var tmpfile = outfile + '.tmp';
        if (minify) {
          grunt.file.write(tmpfile, sourceMap);
          result = uglify.minify(code, {
            fromString: true,
            inSourceMap: tmpfile,
            outSourceMap: mapfile,
            compress: compress
          });
          code = result.code;
          sourceMap = result.map;
          grunt.file.delete(tmpfile);
        }
        grunt.file.write(outfile, code);
        grunt.file.write(mapfile, sourceMap);
      }
      else if (outfile) {
        var code = sweet.compile(file, options).code;
        if (minify) {
          code = uglify.minify(code, {fromString: true, compress: compress}).code;
        }
        grunt.file.write(outfile, code);
      }
      else {
        var code = sweet.compile(file, options).code;
        if (minify) {
          code = uglify.minify(code, {fromString: true, compress: compress}).code;
        }
        console.log(code);
      }
    }
  
    try {
      compile(file);
    }
    catch (e) {
      console.log(e);
    }
  });

  grunt.registerTask('default', ['build']);
  grunt.registerTask('test', ['build', 'build-test', 'mochaTest']);
  grunt.loadNpmTasks('grunt-mocha-test');
};


