var test = require('tape'),
    spawn = require('tape-spawn'),
    format = require('util').format,
    path = require('path'),
    h = require('../helpers');

test('cli: tarifa create: create a new project', function (t) {
    h.project(t);
});

test('cli: jump to new project', function (t) {
    t.plan(1);
    var p = h.currentProjectVal().tmpPath;
    process.chdir(p);
    t.equal(true, true);
    t.end();
});

h.platforms().forEach(function (platform) {
    var pkg = path.join(__dirname, '../../lib/platforms', platform, 'package.json'),
        versions = require(pkg).versions;

    versions.forEach(function (version) {

        test(format('cli: tarifa platform add %s@%s', platform, version), function (t) {
            var st = spawn(t, h.cmd(format('platform add %s@%s', platform, version)));
            st.succeeds();
            st.end();
        });

        test('cli: tarifa platform list', function (t) {
            var st = spawn(t, h.cmd('platform list'));
            st.stdout.match(new RegExp(format('.*%s.*', platform)));
            st.succeeds();
            st.end();
        });

        test(format('cli: tarifa build %s@%s', platform, version), function (t) {
            var st = spawn(t, h.cmd(format('build %s', platform)), {
                stdio: 'inherit'
            });
            st.succeeds();
            st.end();
        });

        test(format('cli: tarifa remove %s@%s', platform, version), function (t) {
            var st = spawn(t, h.cmd(format('platform remove %s', platform)));
            st.succeeds();
            st.end();
        });

    });
});
