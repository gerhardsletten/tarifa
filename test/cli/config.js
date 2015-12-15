var test = require('tape'),
    spawn = require('tape-spawn'),
    fs = require('fs'),
    path = require('path'),
    format = require('util').format,
    h = require('../helpers');

test('cli: tarifa config icons file test.png stage', function (t) {
    var fixture = path.resolve(__dirname, '..', 'fixtures', 'momo.png'),
        st = spawn(t, h.cmd(format('config icons file "%s" stage --verbose', fixture)), {
            stdio: 'inherit'
        });
    st.succeeds();
    st.end();
});

test('cli: tarifa config icons generate red dev', function (t) {
    var st = spawn(t, h.cmd('config icons generate red dev'), {
        stdio: 'inherit'
    });
    st.succeeds();
    st.end();
});

test('cli: tarifa config splashscreens red dev', function (t) {
    var st = spawn(t, h.cmd('config splashscreens red dev'), {
        stdio: 'inherit'
    });
    st.succeeds();
    st.end();
});

test('cli: tarifa config icons generate red', function (t) {
    var st = spawn(t, h.cmd('config icons generate red'), {
        stdio: 'inherit'
    });
    st.succeeds();
    st.end();
});

test('cli: tarifa config splashscreens red', function (t) {
    var st = spawn(t, h.cmd('config splashscreens red'), {
        stdio: 'inherit'
    });
    st.succeeds();
    st.end();
});

test('cli: tarifa config splashscreens oops', function (t) {
    var st = spawn(t, h.cmd('config splashscreens oops'), {
        stdio: 'inherit'
    });
    st.fails();
    st.end();
});

test('cli: tarifa config icons generate oops', function (t) {
    var st = spawn(t, h.cmd('config icons generate oops'), {
        stdio: 'inherit'
    });
    st.fails();
    st.end();
});
