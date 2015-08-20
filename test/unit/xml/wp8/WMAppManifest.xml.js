var path = require('path'),
    test = require('tape'),
    fs = require('fs'),
    tmp = require('tmp'),
    BuildWMAppManifest = require('../../../../lib/platforms/wp8/lib/xml/WMAppManifest.xml'),
    fixture = path.join(__dirname, '../../../fixtures/WMAppManifest.xml');

test('parse wp8\'s WMAppManifest.xml and get title and guid', function(t) {
    t.plan(2);
    BuildWMAppManifest.get(fixture).then(function (result) {
        t.equal(result.title, 'zanimo.js dev');
        t.equal(result.guid, '4ef2e271-8180-44f1-b437-4f932b28f90a');
    });
});

test('change wp8 WMAppManifest.xml\'s title and guid', function (t) {
    t.plan(3);
    var xml = fs.readFileSync(fixture, 'utf-8');

    tmp.file(function (err, p) {
        if (err) throw err;
        fs.writeFileSync(p, xml);
        BuildWMAppManifest.set(
            p,
            'zanimo.js prod',
            'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
            '2.0.0.0'
        ).then(function () {
            BuildWMAppManifest.get(p).then(function (result) {
                t.equal(result.title, 'zanimo.js prod');
                t.equal(result.guid, 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
                t.equal(result.version, '2.0.0.0');
                tmp.setGracefulCleanup();
            }).done();
        }).done();
    });
});
