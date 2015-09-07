var test = require('tape'),
    spawn = require('tape-spawn'),
    path = require('path'),
    fs = require('fs'),
    h = require('../helpers'),
    projVal = {},
    pluginVal = {};

test('tarifa create', function (t) {
    projVal = h.currentProjectVal();
    h.project(t);
});

test('project folders created', function (t) {
    t.plan(7);
    t.ok(h.isDirectory(projVal.tmpPath), 'project created');
    t.ok(h.isDirectory(projVal.tmpPath, 'app'), 'app folder created');
    t.ok(h.isDirectory(projVal.tmpPath, 'project'), 'project folder created');
    t.ok(h.isDirectory(projVal.tmpPath, 'project/bin'), 'project/bin folder created');
    t.ok(h.isDirectory(projVal.tmpPath, 'project/www'), 'project/www folder created');
    t.ok(h.isFile(projVal.tmpPath, 'tarifa.json'), 'tarifa.json file created');
    t.ok(h.isFile(projVal.tmpPath, 'private.json'), 'private.json file created');
});

test('tarifa create plugin', function (t) {
    pluginVal = h.currentPluginVal();
    h.plugin(t);
});

test('plugin folders created', function (t) {
    t.plan(5);
    t.ok(h.isDirectory(pluginVal.tmpPath), 'plugin created');
    t.ok(h.isDirectory(pluginVal.tmpPath, 'www'), 'www folder created');
    t.ok(h.isFile(pluginVal.tmpPath, 'plugin.xml'), 'plugin.xml file created');
    t.ok(h.isDirectory(pluginVal.tmpPath, 'android'), 'android dir created');
    t.ok(h.isDirectory(pluginVal.tmpPath, 'ios'), 'ios dir created');
});

test('tarifa create -h', h.usageTest('create'));

test('tarifa create ejw je wjofiew', function (t) {
    var st = spawn(t, h.cmd('create ejw je wjofiew')),
        usageFilePath = path.join(__dirname, '../../actions/create/usage.txt'),
        helpText = fs.readFileSync(usageFilePath).toString() + '\n';

    st.stdout.match(helpText, 'help text matched');
    st.end();
});
