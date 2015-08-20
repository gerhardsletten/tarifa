var path = require('path'),
    fs = require('fs'),
    test = require('tape'),
    tmp = require('tmp'),
    AndroidManifestXml = require('../../../../lib/platforms/android/lib/xml/AndroidManifest.xml'),
    fixture = path.join(__dirname, '../../../fixtures/AndroidManifest.xml');

test('parse AndroidManifest.xml and find activity name and id', function(t) {
    t.plan(2);
    AndroidManifestXml.getActivityInfo(fixture).then(function (result) {
        t.equal(result.name, 'Ohhhhhh');
        t.equal(result.id, 'com.fortytwoloops.tarifa');
    });
});

test('change activity name and id', function (t) {
    t.plan(2);
    var xml = fs.readFileSync(fixture, 'utf-8');

    tmp.file(function (err, p) {
        if (err) throw err;
        fs.writeFileSync(p, xml);
        AndroidManifestXml.setActivityInfo(
            p,
            'Wrooooooommmm',
            'com.tarifa.test'
        ).then(function () {
            AndroidManifestXml.getActivityInfo(p).then(function (result) {
                t.equal(result.name, 'Wrooooooommmm');
                t.equal(result.id, 'com.tarifa.test');
                tmp.setGracefulCleanup();
            }).done();
        }).done();
    });
});
