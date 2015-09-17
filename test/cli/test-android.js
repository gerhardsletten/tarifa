var test = require('tape'),
    spawn = require('tape-spawn'),
    h = require('../helpers');

h.projectValues();

test('cli: tarifa create', function (t) {
    h.project(t);
});

test('cli: tarifa create, project folders created', function (t) {
    t.plan(1);
    var p = h.currentProjectVal().tmpPath;
    process.chdir(p);
    t.ok(h.isDirectory(p), 'project created');
});

test('cli: tarifa platform add android', function (t) {
    var st = spawn(t, h.cmd('platform add android'), {
        stdio: 'inherit'
    });
    st.succeeds();
    st.end();
});

test('cli: tarifa test android', function (t) {
    var st = spawn(t, h.cmd('test android --verbose'), {
        stdio: 'inherit'
    });
    st.succeeds();
    st.end();
});

h.cleanTest(process.cwd());
