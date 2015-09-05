var test = require('tape'),
    spawn = require('tape-spawn'),
    tarifa = require('../helpers').cmd,
    catValues = require('../helpers').catValues,
    format = require('util').format,
    path = require('path'),
    fs = require('fs'),
    isFile = require('../helpers').isFile,
    isDirectory = require('../helpers').isDirectory,
    projVal = catValues(),
    pluginVal = catValues();

test('tarifa create', function (t) {
    var cmd = format(
            'create --path %s --id %s --name %s',
            projVal.tmpPath,
            projVal.id,
            projVal.name
        ),
        st = spawn(t, tarifa(cmd));
    st.exitCode(0);
    st.end();
});

test('project folders created', function (t) {
    t.plan(7);
    t.ok(isDirectory(projVal.tmpPath), 'project created');
    t.ok(isDirectory(projVal.tmpPath, 'app'), 'app folder created');
    t.ok(isDirectory(projVal.tmpPath, 'project'), 'project folder created');
    t.ok(isDirectory(projVal.tmpPath, 'project/bin'), 'project/bin folder created');
    t.ok(isDirectory(projVal.tmpPath, 'project/www'), 'project/www folder created');
    t.ok(isFile(projVal.tmpPath, 'tarifa.json'), 'tarifa.json file created');
    t.ok(isFile(projVal.tmpPath, 'private.json'), 'private.json file created');
});

test('tarifa create plugin', function (t) {
    var cmd = format(
            'create plugin --path %s --id %s --name %s',
            pluginVal.tmpPath,
            pluginVal.id,
            pluginVal.name
        ),
        st = spawn(t, tarifa(cmd));
    st.exitCode(0);
    st.end();
});

test('plugin folders created', function (t) {
    t.plan(5);
    t.ok(isDirectory(pluginVal.tmpPath), 'plugin created');
    t.ok(isDirectory(pluginVal.tmpPath, 'www'), 'www folder created');
    t.ok(isFile(pluginVal.tmpPath, 'plugin.xml'), 'plugin.xml file created');
    t.ok(isDirectory(pluginVal.tmpPath, 'android'), 'android dir created');
    t.ok(isDirectory(pluginVal.tmpPath, 'ios'), 'ios dir created');
});

test('tarifa create -h', function (t) {
    var st = spawn(t, tarifa('create -h')),
        usageFilePath = path.join(__dirname, '../../actions/create/usage.txt'),
        helpText = fs.readFileSync(usageFilePath).toString() + '\n';

    st.stdout.match(helpText, 'help text matched');
    st.exitCode(0);
    st.end();
});

test('tarifa create ejw je wjofiew', function (t) {
    var st = spawn(t, tarifa('create ejw je wjofiew')),
        usageFilePath = path.join(__dirname, '../../actions/create/usage.txt'),
        helpText = fs.readFileSync(usageFilePath).toString() + '\n';

    st.stdout.match(helpText, 'help text matched');
    st.end();
});
