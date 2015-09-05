var test = require('tape'),
    format = require('util').format,
    spawn = require('tape-spawn'),
    pkg = require('../../package.json'),
    tarifa = require('../helpers').cmd;

test('`tarifa info`, not in a tarifa project', function (t) {
    var st = spawn(t, tarifa('info'));
    st.stdout.match(/.*Not in a tarifa project, can\'t output installed platform versions.*/);
    st.stdout.match(new RegExp(format('.*cordova-lib version: %s.*', pkg.dependencies['cordova-lib'])));
    st.exitCode(0);
    st.end();
});

/* TODO
test('`tarifa info`, in a tarifa project', function (t) { });*/
