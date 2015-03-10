
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
  .alias('a', 'autonomous')
  .describe('a', 'embed mori in the output')
  .boolean('autonomous')
  .argv;

exports.run = function() {
  var infile = argv._[0];
  var outfile = argv.output;
  var watch = argv.watch;
  var sourceMap = argv.sourceMap;
  var minify = argv.minify;
  var compress = argv.compress;
  var autonomous = argv.autonomous;
  compress = compress ? {} : false;

  var file;
  if (infile) {
    file = fs.readFileSync(infile, 'utf8');
  }
  else if (argv._.length === 0) {
    console.log(require("optimist").help());
    return 0;
  }

  var ki_core = fs.readFileSync(path.join(path.dirname(fs.realpathSync(__filename)),'../macros/index.js'), 'utf8');

  var moriSrc;
  if (autonomous) {
    moriSrc = fs.readFileSync(path.join(path.dirname(fs.realpathSync(__filename)),'../node_modules/mori/mori.js'), 'utf8');
  }

  var parseIncludedRules = function(includes) {
    var includeFiles = includes.map(function(path) {
      return fs.readFileSync(path, 'utf8');
    });

    var rules = includeFiles.map(function(includeFile) {
      return ki.parseMacros(includeFile);
    });

    return rules;
  }

  var includes = (typeof argv.include === 'string' ? [argv.include] : argv.include) || [];

  var rules = parseIncludedRules(includes);

  var module = ki.joinModule(file,ki_core,rules);

  var mapfile = path.basename(outfile) + '.map';

  var options = {
    filename: infile,
    modules: sweet.loadModule(module),
    sourceMap: sourceMap,
    mapfile: mapfile,
    minify: minify,
    compress: compress,
    outfile: outfile,
    rules: rules
  };

  var compile = function(src, options, uglify, fs) {
    try {
      var result = ki.compile(src,options,uglify,fs);
      if (autonomous) {
        result.code += 'var mori = ' + moriSrc;
      }
      if (options.outfile) {
        fs.writeFileSync(options.outfile,result.code,'utf8');
        if (options.sourceMap) {
          fs.writeFileSync(options.mapfile,result.sourceMap,'utf8');
        }
      }
      else {
        console.log(result.code);
      }
      return 0;
    }
    catch (e) {
      console.error(e);
      return 1;
    }
  }

  var ret = compile(file,options,uglify,fs);

  var onFileChanged = function() {
    var src = fs.readFileSync(infile, 'utf8');
    var newModule = ki.joinModule(src,ki_core,rules);
    if (module != newModule) {
      module = newModule;
      options.modules = sweet.loadModule(module);
    }
    try {
      if(compile(src,options,uglify,fs) === 0) {
        console.log('Compiled', infile);
      }
      else {
        console.error('Failed to compile', infile);
      }
    }
    catch (e) {
      console.error(e);
    }
  }

  var onIncludedFileChanged = function() {
    try {
      rules = parseIncludedRules(includes);
    }
    catch (e) {
      console.error("Failed to parse", includes);
      return; // don't compile if parseIncludedRules throws
    }
    var module = ki.joinModule(file,ki_core,rules);
    options.modules = sweet.loadModule(module);
    onFileChanged();
  }

  if (watch) {
    var watchOptions = {
      persistent: true,
      interval: 1000
    };
    fs.watchFile(infile, watchOptions, onFileChanged);
    var includeFiles = includes.forEach(function(path) {
      fs.watchFile(path, watchOptions, onIncludedFileChanged);
    });
    return -1;
  }

  return ret;
}
