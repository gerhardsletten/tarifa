var test = require('tape'),
    format = require('util').format,
    spawn = require('tape-spawn'),
    pkg = require('../../package.json'),
    h = require('../helpers');

test('`tarifa info`, not in a tarifa project', function (t) {
    var st = spawn(t, h.cmd('info'));
    st.stdout.match(/.*Not in a tarifa project, can\'t output installed platform versions.*/);
    st.stdout.match(new RegExp(format('.*cordova-lib version: %s.*', pkg.dependencies['cordova-lib'])));
    st.stdout.match(new RegExp(format('.*installed platforms on host: %s.*', h.platforms().join(', '))));
    st.exitCode(0);
    st.end();
});

test('tarifa info -h', h.usageTest('info'));
