
var fs = require('fs');
var path = require('path');
var sweet = require('sweet.js');
var uglify = require('uglify-js');

// TODO: add option to build a version of ki macros that includes modules

var argv = require("optimist")
  .usage("Usage: ki [options] path/to/file.js")
  .alias('o', 'output')
  .describe('o', 'output file path')
  .alias('i', 'include')
  .describe('i', 'include code from file (relative path or npm package)')
  .alias('w', 'watch')
  .describe('w', 'watch a file')
  .boolean('watch')
  .alias('s', 'sourcemap')
  .describe('s', 'generate a sourcemap')
  .boolean('sourcemap')
  .alias('u', 'minify')
  .describe('u', 'minify output code using UglifyJS2')
  .boolean('minify')
  .alias('c', 'compress')
  .describe('c', 'compress and optimize during minify (default true if minify)')
  .boolean('compress')
  .argv;

exports.run = function() {
  var infile = argv._[0];
  var outfile = argv.output;
  var watch = argv.watch;
  var sourcemap = argv.sourcemap;
  var minify = argv.minify;
  var compress = argv.compress;
  compress = compress ? {} : false;

  var file;
  if (infile) {
    file = fs.readFileSync(infile, 'utf8');
  } 
  else if (argv._.length === 0) {
    console.log(require("optimist").help());
    return;
  }

  var ki_core = fs.readFileSync(path.join(path.dirname(fs.realpathSync(__filename)),'../macros/index.js'), 'utf8');
  
  var includes = typeof argv.include === 'string' ? [argv.include] : argv.include;
  var includeFiles = (includes || []).map(function(path) {
    return fs.readFileSync(path, 'utf8');
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
        fs.writeFileSync(tmpfile, sourceMap, 'utf8');
        result = uglify.minify(code, {
          fromString: true,
          inSourceMap: tmpfile,
          outSourceMap: mapfile,
          compress: compress
        });
        code = result.code;
        sourceMap = result.map;
        fs.unlinkSync(tmpfile);
      }
      fs.writeFileSync(outfile, code, 'utf8');
      fs.writeFileSync(mapfile, sourceMap, 'utf8');
    }
    else if (outfile) {
      var code = sweet.compile(file, options).code;
      if (minify) {
        code = uglify.minify(code, {fromString: true, compress: compress}).code;
      }
      fs.writeFileSync(outfile, code, 'utf8');
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

  if (watch) {
    fs.watchFile(infile, {interval: 1000}, function() {
      file = fs.readFileSync(infile, 'utf8');
      try {
        compile(file);
      } 
      catch (e) {
        console.log(e);
      }
      console.log('Compiled',infile);
    });
  }

}

var getNSExprs = function(s,n) {
  var nesting = 0;
  var sexpr = "";
  var res = {matches: [], end: -1};
  for (var i = 0; i < s.length; ++i)
  {
    c = s[i];
    switch (c) {
      case '(':
        nesting++;
        break;
      case ')':
        nesting--;
        if (nesting < 0) {
          return null;
        }
        if (nesting == 0) {
          res.matches.push(sexpr + c);
          sexpr = "";
        }
        if (res.matches.length == n) {
          res.end = i+1;
          return res;
        }
        break;
    }
    if (nesting > 0) {
      sexpr += c;
    }
  }
  return null;
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

