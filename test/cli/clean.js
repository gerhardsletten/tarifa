var test = require('tape'),
    spawn = require('tape-spawn'),
    format = require('util').format,
    h = require('../helpers');

h.platforms().forEach(function (platform) {
    test(format('cli: tarifa clean %s', platform), function (t) {
        var st = spawn(t, h.cmd(format('clean %s --verbose', platform)));
        st.succeeds();
        st.end();
    });
});

test('cli: tarifa clean', function (t) {
    var st = spawn(t, h.cmd('clean --verbose'));
    st.succeeds();
    st.end();
});

test('cli: tarifa clean -h', h.usageTest('clean'));
