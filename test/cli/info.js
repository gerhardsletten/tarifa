var test = require('tape'),
    format = require('util').format,
    spawn = require('tape-spawn'),
    pkg = require('../../package.json'),
    h = require('../helpers');

test('cli: tarifa info', function (t) {
    var st = spawn(t, h.cmd('info'));
    st.stdout.match(new RegExp(format('.*cordova-lib version: %s.*', pkg.dependencies['cordova-lib'])));
    st.stdout.match(new RegExp(format('.*installed platforms on host: %s.*', h.platforms().join(', '))));
    st.succeeds();
    st.end();
});

test('cli: tarifa info -h', h.usageTest('info'));
