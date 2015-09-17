var test = require('tape'),
    spawn = require('tape-spawn'),
    path = require('path'),
    fs = require('fs'),
    h = require('../helpers');

test('cli: tarifa create', function (t) {
    h.project(t);
});

test('cli: tarifa create, project folders created', function (t) {
    t.plan(7);
    var p = h.currentProjectVal().tmpPath;

    // jump to created test project
    process.chdir(p);

    t.ok(h.isDirectory(p), 'project created');
    t.ok(h.isDirectory(p, 'app'), 'app folder created');
    t.ok(h.isDirectory(p, 'project'), 'project folder created');
    t.ok(h.isDirectory(p, 'project/bin'), 'project/bin folder created');
    t.ok(h.isDirectory(p, 'project/www'), 'project/www folder created');
    t.ok(h.isFile(p, 'tarifa.json'), 'tarifa.json file created');
    t.ok(h.isFile(p, 'private.json'), 'private.json file created');
});

test('cli: tarifa create plugin', function (t) {
    h.plugin(t);
});

test('cli: tarifa create plugin, plugin folders created', function (t) {
    t.plan(5);
    var p = h.currentPluginVal().tmpPath;
    t.ok(h.isDirectory(p), 'plugin created');
    t.ok(h.isDirectory(p, 'www'), 'www folder created');
    t.ok(h.isFile(p, 'plugin.xml'), 'plugin.xml file created');
    t.ok(h.isDirectory(p, 'android'), 'android dir created');
    t.ok(h.isDirectory(p, 'ios'), 'ios dir created');
});

test('cli: tarifa create -h', h.usageTest('create'));

test('cli: tarifa create ejw je wjofiew', function (t) {
    var st = spawn(t, h.cmd('create ejw je wjofiew')),
        usageFilePath = path.join(__dirname, '..', '..', 'actions', 'create', 'usage.txt'),
        helpText = fs.readFileSync(usageFilePath).toString() + '\n';

    st.stdout.match(helpText, 'help text matched');
    st.end();
});
