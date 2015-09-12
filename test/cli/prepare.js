var test = require('tape'),
    spawn = require('tape-spawn'),
    format = require('util').format,
    h = require('../helpers');

test('cli: tarifa prepare -h', h.usageTest('prepare'));

h.platforms().forEach(function (platform){
    test(format('cli: tarifa platform add %s', platform), function (t) {
        var st = spawn(t, h.cmd(format('platform add %s', platform)));
        st.succeeds();
        st.end();
    });
    test(format('cli: tarifa prepare %s', platform), function (t) {
        var st = spawn(t, h.cmd(format('prepare %s', platform)));
        st.succeeds();
        st.end();
    });
    test(format('cli: tarifa prepare %s result', platform), function (t) {
        t.plan(1);
        t.ok(h.isFile(h.currentProjectVal().tmpPath, 'project/www/main.js'), 'main.js created');
    });
});
