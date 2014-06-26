
var fs = require('fs');
var path = require('path');
var sweet = require('sweet.js');
var uglify = require('uglify-js');
var ki = require('./ki.js');

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
  .alias('s', 'sourceMap')
  .describe('s', 'generate a sourceMap')
  .boolean('sourceMap')
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
  var sourceMap = argv.sourceMap;
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
    return ki.parseMacros(includeFile);
  });

  var module = ki.joinModule(file,ki_core,rules);

  var mapfile = path.basename(outfile) + '.map';

  var options = {
    filename: infile,
    modules: [sweet.loadModule(module)],
    sourceMap: sourceMap,
    mapfile: mapfile,
    minify: minify,
    compress: compress,
    rules: rules
  };

  var compile = function() {
    try {
      var result = ki.compile(file,options,uglify,fs);
      if (outfile) {
        fs.writeFileSync(outfile,result.code,'utf8');
        if (sourceMap) {
          fs.writeFileSync(mapfile,result.sourceMap,'utf8');
        }
      }
      else {
        console.log(result.code);
      }
    }
    catch (e) {
      console.log(e);
    }
  }

  compile();

  if (watch) {
    fs.watchFile(infile, {interval: 1000}, function() {
      file = fs.readFileSync(infile, 'utf8');
      try {
        compile();
      } 
      catch (e) {
        console.log(e);
      }
      console.log('Compiled',infile);
    });
  }
}

