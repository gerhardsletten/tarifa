var test = require('tape'),
    spawn = require('tape-spawn'),
    h = require('../helpers');

test('tarifa prepare -h', h.usageTest('prepare'));

test('tarifa platform add browser', function (t) {
    var projVal = h.currentProjectVal(),
        pwd = process.cwd();

    process.chdir(projVal.tmpPath);
    var st = spawn(t, h.cmd('platform add browser'));
    st.exitCode(0);
    process.chdir(pwd);
    st.end();
});

test('tarifa prepare browser', function (t) {
    var projVal = h.currentProjectVal(),
        pwd = process.cwd();

    process.chdir(projVal.tmpPath);
    var st = spawn(t, h.cmd('prepare browser'));
    st.exitCode(0);
    process.chdir(pwd);
    st.end();
});

test('tarifa prepare browser result', function (t) {
    t.plan(1);
    t.ok(h.isFile(h.currentProjectVal().tmpPath, 'project/www/main.js'), 'main.js created');
});
