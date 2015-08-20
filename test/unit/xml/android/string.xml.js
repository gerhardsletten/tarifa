var path = require('path'),
    test = require('tape'),
    fs = require('fs'),
    tmp = require('tmp'),
    stringXml = require('../../../../lib/platforms/android/lib/xml/string.xml'),
    fixture = path.join(__dirname, '../../../fixtures/strings.xml');

test('parsing android/res/values/strings.xml and getting app_name', function(t) {
    t.plan(1);
    stringXml.getAppName(fixture).then(function (app_name) {
        t.equal(app_name, 'demo prod');
    });
});

test('parsing android/res/values/strings.xml and change app_name', function (t) {
    t.plan(1);

    var xml = fs.readFileSync(fixture, 'utf-8');
    tmp.file(function (err, p) {
        if (err) throw err;
        fs.writeFileSync(p, xml);
        stringXml.changeAppName(p, 'another app name').then(function () {
            stringXml.getAppName(p).then(function (app_name) {
                t.equal(app_name, 'another app name');
                tmp.setGracefulCleanup();
            }).done();
        }).done();
    });
});
