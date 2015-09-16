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
    var p = path.join(h.currentProjectVal().tmpPath, 'private.json'),
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
                        keystore_path: path.join(__dirname, '../fixtures/demo.keystore'),
                        keystore_alias: '123456',
                        keystore_password: '123456',
                        alias_password: '123456'
                    }
                }
            }
        };

    fs.writeFileSync(p, JSON.stringify(o));
}

function getSigningInfo(file) {
    try {
        var f = path.join(__dirname, '../fixtures', file);
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

function mockWP8(certif_path, pass) {
    var p = path.join(h.currentProjectVal().tmpPath, 'private.json'),
        o = {
            configurations: {
                wp8: {
                    prod: {
                        sign: 'store',
                        release: true
                    }
                }
            },
            signing: {
                wp8: {
                    store: {
                        certificate_path: certif_path,
                        certificate_password: pass
                    }
                }
            }
        };
    if(certif_path && pass)
        fs.writeFileSync(p, JSON.stringify(o));
}

h.platforms().forEach(function (platform) {

    test(format('cli: tarifa platform add %s', platform), function (t) {
        var st = spawn(t, h.cmd(format('platform add %s', platform)), {
            stdio: 'inherit'
        });
        st.succeeds();
        st.end();
    });

    test('cli: tarifa info --dump-configuration', function (t) {
        var o = getSigningInfo('private.ios.json'),
            i = getSigningInfo('private.wp8.json');
        if(platform === 'android') mockAndroid();
        if(platform === 'ios') {
            mockIos(o.id, o.identity, o.provisioning_name, o.provisioning_path);
        }

        if(platform === 'wp8') {
            mockWP8(i.certificate_path, i.password);
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
