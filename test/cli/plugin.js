var test = require('tape'),
    spawn = require('tape-spawn'),
    format = require('util').format,
    h = require('../helpers'),
    plugins = require('../../lib/plugins.json'),
    tmp = h.currentPluginVal();

test('cli: tarifa plugin -h', h.usageTest('plugin'));

test(format('cli: tarifa plugin add "%s"', tmp.tmpPath), function (t) {
    var st = spawn(t, h.cmd(format('plugin add "%s"', tmp.tmpPath)), {
        stdio: 'inherit'
    });
    st.succeeds();
    st.end();
});

test('cli: tarifa plugin list', function (t) {
    var st = spawn(t, h.cmd('plugin list'));
    st.stdout.match(new RegExp('.*' + tmp.id + '.*'));
    st.succeeds();
    st.end();
});

test('cli: tarifa plugin remove cordova-plugin-splashscreen', function (t) {
    var st = spawn(t, h.cmd('plugin remove cordova-plugin-splashscreen'), {
        stdio: 'inherit'
    });
    st.succeeds();
    st.end();
});

test('cli: tarifa plugin remove cordova-plugin-whitelist', function (t) {
    var st = spawn(t, h.cmd('plugin remove cordova-plugin-whitelist'), {
        stdio: 'inherit'
    });
    st.succeeds();
    st.end();
});

test(format('cli: tarifa plugin remove %s', tmp.id), function (t) {
    var st = spawn(t, h.cmd(format('plugin remove %s', tmp.id)), {
        stdio: 'inherit'
    });
    st.succeeds();
    st.end();
});

plugins.forEach(function (plugin) {
    test(format('cli: tarifa plugin add %s', plugin.uri), function (t) {
        var st = spawn(t, h.cmd(format('plugin add %s', plugin.uri)), {
            stdio: 'inherit'
        });
        st.succeeds();
        st.end();
    });
});
