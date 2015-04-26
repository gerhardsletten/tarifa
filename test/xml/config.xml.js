var should = require('should'),
    path = require('path'),
    fs = require('fs'),
    Q = require('q'),
    tmp = require('tmp'),
    ConfigXml = require('../../lib/xml/config.xml');

describe('[shared] read/write cordova\'s config.xml', function() {

    it('parse config.xml', function () {
        var file = path.join(__dirname, '../fixtures/config.xml');
        return ConfigXml.get(file).then(function (result) {
            result.id.should.equal('tools.tarifa.fixture');
            result.version.should.equal('0.0.0');
            result.author_name.should.equal('paul');
            result.author_email.should.equal('paul@42loops.com');
            result.author_href.should.equal('http://42loops.com');
            result.description.should.equal('toto');

            result.whitelist.shared.filter(function (w) {
                return w.type === 'access-origin';
            })[0].origin[0].should.equal('*');
            result.whitelist.shared.filter(function (w) {
                return w.type === 'allow-navigation';
            })[0].origin[0].should.equal('*');
            result.whitelist.shared.filter(function (w) {
                return w.type === 'allow-intent';
            })[0].origin[0].should.equal('tel:*');

            result.preference.DisallowOverscroll.should.equal('true');
            result.preference.KeyboardDisplayRequiresUserAction.should.equal('false');
            result.preference.KeyboardDisplayRequiresUserAction.should.equal('false');
            result.preference.EnableViewportScale.should.equal('false');
        });
    });

    it('change id', function () {
        var file = path.join(__dirname, '../fixtures/config.xml'),
            xml = fs.readFileSync(file, 'utf-8'),
            defer = Q.defer();

        tmp.file(function (err, p, fd) {
            if (err) throw err;
            fs.writeFileSync(p, xml);
            return ConfigXml.set(p, 'tools.tarifa.test').then(function () {
                return ConfigXml.get(p).then(function (result) {
                    result.id.should.equal('tools.tarifa.test');
                    tmp.setGracefulCleanup();
                    defer.resolve();
                }).done();
            });
        });
        return defer.promise;
    });

    it('change id, version, author, description, preference, whitelist', function () {
        var file = path.join(__dirname, '../fixtures/config.xml'),
            xml = fs.readFileSync(file, 'utf-8'),
            defer = Q.defer();

        tmp.file(function (err, p, fd) {
            if (err) throw err;
            fs.writeFileSync(p, xml);

            var pref = {
                DisallowOverscroll: false,
                KeyboardDisplayRequiresUserAction:false,
                'newpreference':'what you want...',
                'newpreference2':'what you want...2'
            };

            return ConfigXml.set(
                p,
                'tools.tarifa.oops',
                '1.0.0',
                'pp',
                'pp@42loops.com',
                'http://tarifa.tools',
                'this is a test',
                pref,
                {
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
                }
            ).then(function () {
                return ConfigXml.get(p).then(function (result) {
                    result.id.should.equal('tools.tarifa.oops');
                    result.version.should.equal('1.0.0');
                    result.author_name.should.equal('pp');
                    result.author_email.should.equal('pp@42loops.com');
                    result.author_href.should.equal('http://tarifa.tools');
                    result.description.should.equal('this is a test');
                    result.whitelist.shared.filter(function (w) {
                        return w.type === 'access-origin';
                    })[0].origin[0].should.equal('tarifa.tools');
                    result.whitelist.shared.filter(function (w) {
                        return w.type === 'access-origin';
                    })[0].origin[1].should.equal('zengularity.com');
                    result.whitelist.shared.filter(function (w) {
                        return w.type === 'allow-intent';
                    })[0].origin[0].should.equal('tel:*');
                    result.whitelist.shared.filter(function (w) {
                        return w.type === 'allow-navigation';
                    }).should.have.length(0);
                    result.whitelist.android.filter(function (w) {
                        return w.type === 'allow-navigation';
                    })[0].origin[0].should.equal('google.com');
                    result.whitelist.shared.should.have.length(2);
                    result.preference.DisallowOverscroll.should.equal('false');
                    result.preference.KeyboardDisplayRequiresUserAction.should.equal('false');
                    result.preference.newpreference.should.equal('what you want...');
                    result.preference.newpreference2.should.equal('what you want...2');
                    tmp.setGracefulCleanup();
                    defer.resolve();
                }).done();
            });
        });
        return defer.promise;
    });

});
