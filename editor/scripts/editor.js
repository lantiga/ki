requirejs.config({
    shim: {
        'underscore': {
            exports: '_'
        }
    }
});

require(["./ki", "text!ki.sjs", "./mori", "./sweet"], function(ki, ki_core, mori, sweet) {
    var storage_code = 'editor_code';
    var storage_mode = 'editor_mode';

    var starting_code = $("#editor").text();

    var editor = CodeMirror.fromTextArea($('#editor')[0], {
        lineNumbers: true,
        smartIndent: false,
        indentWithTabs: true,
        tabSize: 4,
        autofocus: true,
        theme: 'sweetprism',
        extraKeys: {
          "Ctrl-Enter": function(cm) {
            run();
          }
        }
    });

    if (window.location.hash) {
        editor.setValue(decodeURI(window.location.hash.slice(1)));
    } else {
        editor.setValue(localStorage[storage_code] ? localStorage[storage_code] : starting_code);
    }
    if(localStorage[storage_mode]) {
        editor.setOption("keyMap", localStorage[storage_mode]);
    }

    var output = CodeMirror.fromTextArea($('#output')[0], {
        lineNumbers: true,
        theme: 'sweetprism',
        readOnly: true
    });

    var updateTimeout;
    editor.on("change", function(e) {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(updateExpand, 200);
    });

    $('#btn-run').click(function() {
      run();
    });

    var displayRequire = false;
    $('#ck-require').click(function() {
      displayRequire = !displayRequire;
      updateExpand();
    });

    var options = {
      modules: sweet.loadModule(ki.joinModule(editor.getValue(),ki_core))
    };

    $('#edit-box').css({visibility: 'visible'})
    $('#output-box').css({visibility: 'visible'})

    $('#btn-reload-macros').click(function() {
      options.modules = sweet.loadModule(ki.joinModule(editor.getValue(),ki_core));
    });

    function updateExpand() {
        var code = editor.getValue();
        window.location = "editor.html#" + encodeURI(code);
        localStorage[storage_code] = code;
        try {
            if (!displayRequire) {
              code = code.replace('ki require core','');
            }
            var res = ki.compile(code,options);
            output.setValue(res.code);

            $('#errors').text('');
            $('#errors').hide();
        } catch (e) {
            $('#return').hide();
            $('#errors').text(e);
            $('#errors').show();
        }
    }
    updateExpand();

    function run() {
      var code = editor.getValue();
      var res = ki.compile(code,options);
      try {
        $('#errors').text('');
        $('#errors').hide();
        $('#return').text('Output: ' + eval('(function() {' + res.code + '}())'));
        $('#return').show();
      } catch (e) {
        $('#return').text('');
        $('#return').hide();
        $('#errors').text(e);
        $('#errors').show();
      }
    }
});
