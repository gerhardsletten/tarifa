var test = require('tape'),
    path = require('path'),
    fs = require('fs'),
    tmp = require('tmp'),
    ConfigXml = require('../../../lib/xml/config.xml'),
    fixture = path.join(__dirname, '../../fixtures/config.xml');

test('unit: parse cordova\'s config.xml', function (t) {
    t.plan(12);
    ConfigXml.get(fixture).then(function (r) {

        t.equal(r.id, 'tools.tarifa.fixture');
        t.equal(r.version, '0.0.0');
        t.equal(r.author_name, 'paul');
        t.equal(r.author_email, 'paul@42loops.com');
        t.equal(r.author_href, 'http://42loops.com');
        t.equal(r.description, 'toto');

        t.equal(r.whitelist.shared.filter(function (w) {
            return w.type === 'access-origin';
        })[0].origin[0], '*');

        t.equal(r.whitelist.shared.filter(function (w) {
            return w.type === 'allow-navigation';
        })[0].origin[0], '*');

        t.equal(r.whitelist.shared.filter(function (w) {
            return w.type === 'allow-intent';
        })[0].origin[0], 'tel:*');

        t.equal(r.preference.DisallowOverscroll, 'true');
        t.equal(r.preference.KeyboardDisplayRequiresUserAction, 'false');
        t.equal(r.preference.EnableViewportScale, 'false');
    });
});

test('unit: change cordova\'s config.xml id', function (t) {
    t.plan(1);

    tmp.file(function (err, p) {
        if (err) throw err;
        fs.writeFileSync(p, fs.readFileSync(fixture, 'utf-8'));
        ConfigXml.set(p, 'tools.tarifa.test').then(function () {
            ConfigXml.get(p).then(function (r) {
                t.equal(r.id, 'tools.tarifa.test');
                tmp.setGracefulCleanup();
            }).done();
        }).done();
    });
});

test('unit: change cordova\'s config.xml id', function (t) {
    t.plan(16);

    var pref = {
            DisallowOverscroll: false,
            KeyboardDisplayRequiresUserAction: false,
            'newpreference': 'what you want...',
            'newpreference2': 'what you want...2'
        },
        whitelist = {
            shared: [
                {
                    type: 'access-origin',
                    origin: ['tarifa.tools', 'zengularity.com']
                },
                {
                    type: 'allow-intent',
                    origin: ['tel:*']
                },
                {
                    type: 'allow-navigation',
                    origin: ['github.com']
                }
            ],
            android: [
                {
                    type: 'allow-navigation',
                    origin: ['google.com']
                }
            ]
        };

    tmp.file(function (err, p) {
        if (err) throw err;
        fs.writeFileSync(p, fs.readFileSync(fixture, 'utf-8'));
        ConfigXml.set(
            p,
            'tools.tarifa.oops',
            '1.0.0',
            'pp',
            'pp@42loops.com',
            'http://tarifa.tools',
            'this is a test',
            pref,
            whitelist
        ).then(function () {
            ConfigXml.get(p).then(function (r) {

                t.equal(r.id, 'tools.tarifa.oops');
                t.equal(r.version, '1.0.0');
                t.equal(r.author_name, 'pp');
                t.equal(r.author_email, 'pp@42loops.com');
                t.equal(r.author_href, 'http://tarifa.tools');
                t.equal(r.description, 'this is a test');

                t.equal(r.whitelist.shared.filter(function (w) {
                    return w.type === 'access-origin';
                })[0].origin[0], 'tarifa.tools');

                t.equal(r.whitelist.shared.filter(function (w) {
                    return w.type === 'access-origin';
                })[0].origin[1], 'zengularity.com');

                t.equal(r.whitelist.shared.filter(function (w) {
                    return w.type === 'allow-intent';
                })[0].origin[0], 'tel:*');

                t.equal(r.whitelist.shared.filter(function (w) {
                    return w.type === 'allow-navigation';
                }).length, 0);

                t.equal(r.whitelist.android.filter(function (w) {
                    return w.type === 'allow-navigation';
                })[0].origin[0], 'google.com');

                t.equal(r.whitelist.shared.length, 2);
                t.equal(r.preference.DisallowOverscroll, 'false');
                t.equal(r.preference.KeyboardDisplayRequiresUserAction, 'false');
                t.equal(r.preference.newpreference, 'what you want...');
                t.equal(r.preference.newpreference2, 'what you want...2');
                tmp.setGracefulCleanup();
            }).done();
        }).done();
    });
});
