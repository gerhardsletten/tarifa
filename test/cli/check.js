var test = require('tape'),
    path = require('path'),
    spawn = require('tape-spawn'),
    rimraf = require('rimraf'),
    h = require('../helpers');

test('cli: tarifa create: create a new project', function (t) {
    h.projectValues();
    h.project(t);
});

test('cli: jump to new project', function (t) {
    t.plan(1);
    var p = h.currentProjectVal().tmpPath;
    process.chdir(p);
    t.equal(true, true);
    t.end();
});

test('cli: tarifa platform add android', function (t) {
    var st = spawn(t, h.cmd('platform add android'), {
        stdio: 'inherit'
    });
    st.succeeds();
    st.end();
});

test('cli: tarifa check', function (t) {
    var st = spawn(t, h.cmd('check'), {
        stdio: 'inherit'
    });
    st.succeeds();
    st.end();
});

test('cli: tarifa check when `app` and `images` folder not available', function (t) {
    rimraf.sync(path.resolve(h.currentProjectVal().tmpPath, 'app'));
    rimraf.sync(path.resolve(h.currentProjectVal().tmpPath, 'images'));
    var st = spawn(t, h.cmd('check'), {
        stdio: 'inherit'
    });
    st.succeeds();
    st.end();
});

test('cli: tarifa check --force', function (t) {
    var st = spawn(t, h.cmd('check --force'), {
        stdio: 'inherit'
    });
    st.succeeds();
    st.end();
});

test('cli: tarifa check -h', h.usageTest('check'));

h.cleanTest(process.cwd());