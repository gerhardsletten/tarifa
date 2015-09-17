var test = require('tape'),
    spawn = require('tape-spawn'),
    format = require('util').format,
    h = require('../helpers');

test('cli: tarifa build -h', h.usageTest('build'));

test('cli: tarifa build all dev,stage', function (t) {
    var st = spawn(t, h.cmd('build browser dev,stage'), {
        stdio: 'inherit'
    });
    st.succeeds();
    st.end();
});

h.platforms().forEach(function (platform) {
    test(format('cli: tarifa build %s', platform), function (t) {
        var st = spawn(t, h.cmd(format('build %s --verbose', platform)), {
            stdio: 'inherit'
        });
        st.succeeds();
        st.end();
    });
});

test('cli: tarifa build browser in `project` folder', function (t) {
    process.chdir('./project');
    var st = spawn(t, h.cmd('build browser dev,stage'), {
        stdio: 'inherit'
    });
    process.chdir('..');
    st.succeeds();
    st.end();
});

