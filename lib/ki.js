
var fs = require('fs');
var path = require('path');
var sweet = require('sweet.js');

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
  .alias('c', 'sourcemap')
  .describe('c', 'generate a sourcemap')
  .boolean('sourcemap')
  .argv;

exports.run = function() {
  var infile = argv._[0];
  var outfile = argv.output;
  var watch = argv.watch;
  var sourcemap = argv.sourcemap;

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
      fs.writeFileSync(outfile, result.code + '\n//# sourceMappingURL=' + mapfile, 'utf8');
      fs.writeFileSync(outfile + '.map', result.sourceMap, 'utf8');
    }
    else if (outfile) {
      fs.writeFileSync(outfile, sweet.compile(file, options).code, 'utf8');
    }
    else {
      console.log(sweet.compile(file, options).code);
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

