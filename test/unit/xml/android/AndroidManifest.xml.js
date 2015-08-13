var path = require('path'),
    fs = require('fs'),
    Q = require('q'),
    tmp = require('tmp'),
    AndroidManifestXml = require('../../../../lib/platforms/android/lib/xml/AndroidManifest.xml');

describe('[android] replacing stuff in AndroidManifest.xml', function(){

    var fixture = path.join(__dirname, '../../../fixtures/AndroidManifest.xml');

    it('find activity name and id', function () {
        return AndroidManifestXml.getActivityInfo(fixture).then(function (result) {
            result.name.should.equal('Ohhhhhh');
            result.id.should.equal('com.fortytwoloops.tarifa');
        });
    });

    it('change activity name and id', function () {
        var xml = fs.readFileSync(fixture, 'utf-8'),
            defer = Q.defer();

        tmp.file(function (err, p) {
            if (err) throw err;
            fs.writeFileSync(p, xml);
            return AndroidManifestXml.setActivityInfo(p, 'Wrooooooommmm', 'com.tarifa.test').then(function () {
                return AndroidManifestXml.getActivityInfo(p).then(function (result) {
                    result.name.should.equal('Wrooooooommmm');
                    result.id.should.equal('com.tarifa.test');
                    tmp.setGracefulCleanup();
                    defer.resolve();
                }).done();
            });
        });

        return defer.promise;
    });
});
