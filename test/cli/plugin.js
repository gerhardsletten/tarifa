var test = require('tape'),
    spawn = require('tape-spawn'),
    format = require('util').format,
    h = require('../helpers'),
    plugins = require('../../lib/plugins.json'),
    tmp = h.currentPluginVal();

test('cli: tarifa plugin -h', h.usageTest('plugin'));

test(format('cli: tarifa plugin add %s', tmp.tmpPath), function (t) {
    var st = spawn(t, h.cmd(format('plugin add %s', tmp.tmpPath)));
    st.exitCode(0);
    st.end();
});

test('cli: tarifa plugin list', function (t) {
    var st = spawn(t, h.cmd('plugin list'));
    st.stdout.match(new RegExp('.*' + tmp.id + '.*'));
    st.exitCode(0);
    st.end();
});

test('cli: tarifa plugin add https://github.com/apache/cordova-plugin-vibration.git#r0.3.11', function (t) {
    var st = spawn(t, h.cmd('plugin add https://github.com/apache/cordova-plugin-vibration.git#r0.3.11'));
    st.exitCode(0);
    st.end();
});

test('cli: tarifa plugin list', function (t) {
    var st = spawn(t, h.cmd('plugin list'));
    st.stdout.match(/org\.apache\.cordova\.vibration/, 'added plugin matched');
    st.exitCode(0);
    st.end();
});

test('cli: tarifa plugin remove org.apache.cordova.vibration', function (t) {
    var st = spawn(t, h.cmd('plugin remove org.apache.cordova.vibration'));
    st.exitCode(0);
    st.end();
});

test('cli: tarifa plugin remove cordova-plugin-splashscreen', function (t) {
    var st = spawn(t, h.cmd('plugin remove cordova-plugin-splashscreen'));
    st.exitCode(0);
    st.end();
});

test('cli: tarifa plugin remove cordova-plugin-whitelist', function (t) {
    var st = spawn(t, h.cmd('plugin remove cordova-plugin-whitelist'));
    st.exitCode(0);
    st.end();
});

test(format('cli: tarifa plugin remove %s', tmp.id), function (t) {
    var st = spawn(t, h.cmd(format('plugin remove %s', tmp.id)));
    st.exitCode(0);
    st.end();
});

plugins.forEach(function (plugin) {
    test(format('cli: tarifa plugin add %s', plugin.uri), function (t) {
        var st = spawn(t, h.cmd(format('plugin add %s', plugin.uri)));
        st.exitCode(0);
        st.end();
    });
});
