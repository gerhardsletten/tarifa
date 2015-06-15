var should = require('should'),
    path = require('path'),
    fs = require('fs'),
    Q = require('q'),
    tmp = require('tmp'),
    BuildWMAppManifest = require('../../../lib/platforms/wp8/lib/xml/WMAppManifest.xml');

describe('[wp8] read/write WMAppManifest.xml', function() {

    it('get title and guid', function () {
        var file = path.join(__dirname, '../../fixtures/WMAppManifest.xml');
        return BuildWMAppManifest.get(file).then(function (result) {
            result.title.should.equal('zanimo.js dev');
            result.guid.should.equal('4ef2e271-8180-44f1-b437-4f932b28f90a');
        });
    });

    it('change title and guid', function () {
        var xml = fs.readFileSync(path.join(__dirname, '../../fixtures/WMAppManifest.xml'), 'utf-8'),
            defer = Q.defer();

        tmp.file(function (err, p, fd) {
            if (err) throw err;
            fs.writeFileSync(p, xml);
            return BuildWMAppManifest.set(p, 'zanimo.js prod', 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', '2.0.0.0').then(function () {
                return BuildWMAppManifest.get(p).then(function (result) {
                    result.title.should.equal('zanimo.js prod');
                    result.guid.should.equal('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
                    result.version.should.equal('2.0.0.0');
                    tmp.setGracefulCleanup();
                    defer.resolve();
                }).done();
            });
        });

        return defer.promise;
    });
});
