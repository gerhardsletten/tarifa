var test = require('tape'),
    fs = require('fs'),
    path = require('path'),
    spawn = require('tape-spawn'),
    format = require('util').format,
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

function mockAndroid() {
    var proj = h.currentProjectVal().tmpPath,
        p = path.join(proj, 'private.json'),
        dest = path.join(proj, 'app', 'platforms', 'android', 'demo.keystore'),
        out = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'demo.keystore')),
        o = {
            configurations: {
                android: {
                    prod: {
                        sign: 'store'
                    }
                }
            },
            signing: {
                android: {
                    store: {
                        keystore_path: 'demo.keystore',
                        keystore_alias: '123456',
                        keystore_password: '123456',
                        alias_password: '123456'
                    }
                }
            }
        };
    fs.writeFileSync(dest, out);
    fs.writeFileSync(p, JSON.stringify(o));
}

function getSigningInfo(file) {
    try {
        var f = path.resolve(path.dirname(__dirname), 'fixtures', file);
        return JSON.parse(fs.readFileSync(f, 'utf-8'));
    } catch(err) {
        return {};
    }
}

function mockIos(id, identity, provisioning_name, provisioning_path) {
    var p = path.join(h.currentProjectVal().tmpPath, 'private.json'),
        o = {
            configurations: {
                ios: {
                    prod: {
                        sign: 'store',
                        release: true,
                        id: id
                    }
                }
            },
            signing: {
                ios: {
                    store: {
                        identity: identity,
                        provisioning_path: provisioning_path,
                        provisioning_name: provisioning_name
                    }
                }
            }
        };
    if(id && identity && provisioning_name && provisioning_path)
        fs.writeFileSync(p, JSON.stringify(o));
    else fs.writeFileSync(p, '{}');
}

h.platforms().forEach(function (platform) {

    test(format('cli: tarifa platform add %s', platform), function (t) {
        var st = spawn(t, h.cmd(format('platform add %s', platform)), {
            stdio: 'inherit'
        });
        st.succeeds();
        st.end();
    });

    test(format('cli: tarifa info --dump-configuration (%s)', platform), function (t) {
        var o = getSigningInfo('private.ios.json');
        if(platform === 'android') mockAndroid();
        if(platform === 'ios') {
            mockIos(o.id, o.identity, o.provisioning_name, o.provisioning_path);
        }

        var st = spawn(t, h.cmd('info --dump-configuration'), {
            stdio: 'inherit'
        });

        st.succeeds();
        st.end();
    });

    test(format('cli: tarifa build %s prod', platform), function (t) {
        var st = spawn(t, h.cmd(format('build %s prod --verbose', platform)), {
            stdio: 'inherit'
        });
        st.succeeds();
        st.end();
    });
});

h.cleanTest(process.cwd());
