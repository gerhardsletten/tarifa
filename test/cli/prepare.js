var test = require('tape'),
    spawn = require('tape-spawn'),
    format = require('util').format,
    h = require('../helpers');

test('tarifa prepare -h', h.usageTest('prepare'));

h.platforms().forEach(function (platform){
    test(format('tarifa platform add %s', platform), function (t) {
        var projVal = h.currentProjectVal(),
            pwd = process.cwd();

        process.chdir(projVal.tmpPath);
        var st = spawn(t, h.cmd(format('platform add %s', platform)));
        st.exitCode(0);
        process.chdir(pwd);
        st.end();
    });
});

h.platforms().forEach(function (platform){
    test(format('tarifa prepare %s', platform), function (t) {
        var projVal = h.currentProjectVal(),
            pwd = process.cwd();

        process.chdir(projVal.tmpPath);
        var st = spawn(t, h.cmd(format('prepare %s', platform)));
        st.exitCode(0);
        process.chdir(pwd);
        st.end();
    });
    test(format('tarifa prepare %s result', platform), function (t) {
        t.plan(1);
        t.ok(h.isFile(h.currentProjectVal().tmpPath, 'project/www/main.js'), 'main.js created');
    });
});
