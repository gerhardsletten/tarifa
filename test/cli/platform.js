var test = require('tape'),
    spawn = require('tape-spawn'),
    format = require('util').format,
    h = require('../helpers');

test('cli: tarifa platform -h', h.usageTest('platform'));

h.platforms().forEach(function (platform) {
    test(format('cli: tarifa platform remove %s', platform), function (t) {
        var st = spawn(t, h.cmd(format('platform remove %s', platform)), {
            stdio: 'inherit'
        });
        st.succeeds();
        st.end();
    });
    test(format('cli: tarifa platform add %s', platform), function (t) {
        var st = spawn(t, h.cmd(format('platform add %s', platform)), {
            stdio: 'inherit'
        });
        st.succeeds();
        st.end();
    });
    test(format('cli: tarifa platform add %s', platform), function (t) {
        var st = spawn(t, h.cmd(format('platform add %s', platform)));
        st.stdout.match(/.*Platform already installed!.*/);
        st.end();
    });
});
