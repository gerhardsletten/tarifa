var test = require('tape'),
    spawn = require('tape-spawn'),
    h = require('../helpers');

test('cli: tarifa device', function (t) {
    var st = spawn(t, h.cmd('device'), {
        stdio: 'inherit'
    });
    st.succeeds();
    st.end();
});

test('cli: tarifa device --verbose', function (t) {
    var st = spawn(t, h.cmd('device --verbose'), {
        stdio: 'inherit'
    });
    st.succeeds();
    st.end();
});

test('cli: tarifa device -h', h.usageTest('device'));
