
var fs = require('fs');
var path = require('path');
var sweet = require('sweet.js');
var uglify = require('uglify-js');

// TODO: add option to build a version of ki macros that includes modules

var argv = require("optimist")
  .usage("Usage: ki [options] path/to/file.js")
  .alias('o', 'output')
  .describe('o', 'output file path')
  .alias('m', 'macros')
  .describe('m', 'load ki macro definitions from file (relative path or npm package)')
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

  var cwd = process.cwd();
  var macros = typeof argv.macros === 'string' ? [argv.macros] : argv.macros;
  var sexprs = (macros || []).map(function(path) {
    return fs.readFileSync(path, 'utf8');
  });
  var ki_core = fs.readFileSync(path.join(path.dirname(fs.realpathSync(__filename)),'../macros/index.js'), 'utf8');
  var module = ki_core.replace('/*__macros__*/',sexprs.join('\n'));
  var options = {
    filename: infile,
    modules: [sweet.loadModule(module)]
  };

  var compile = function(file) {
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

