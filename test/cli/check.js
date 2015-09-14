var test = require('tape'),
    path = require('path'),
    spawn = require('tape-spawn'),
    rimraf = require('rimraf'),
    h = require('../helpers');

test('cli: tarifa check', function (t) {
    var st = spawn(t, h.cmd('check'));
    st.succeeds();
    st.end();
});

test('cli: tarifa check when `app` and `images` folder not available', function (t) {
    rimraf.sync(path.resolve(h.currentProjectVal().tmpPath, 'app'));
    rimraf.sync(path.resolve(h.currentProjectVal().tmpPath, 'images'));
    var st = spawn(t, h.cmd('check'));
    st.succeeds();
    st.end();
});

test('cli: tarifa check --force', function (t) {
    var st = spawn(t, h.cmd('check --force'));
    st.succeeds();
    st.end();
});

test('cli: tarifa check -h', h.usageTest('check'));
