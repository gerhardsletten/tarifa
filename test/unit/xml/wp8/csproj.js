var path = require('path'),
    fs = require('fs'),
    test = require('tape'),
    tmp = require('tmp'),
    BuildCsproj = require('../../../../lib/platforms/wp8/lib/xml/csproj'),
    fixture = path.join(__dirname, '../../../fixtures/zanimo_js.csproj');

test('parsing wp8 csproj file and extracting xap filename', function(t) {
    t.plan(1);
    BuildCsproj.getProductFilename(fixture).then(function (name) {
        t.equal(name, 'zanimojsdev.xap');
    });
});

test('parsing wp8 csproj file and changing xap file name', function (t) {
    t.plan(1);

    var xml = fs.readFileSync(fixture, 'utf-8');

    tmp.file(function (err, p) {
        if (err) throw err;
        fs.writeFileSync(p, xml);
        BuildCsproj.setProductFilename(p, 'Ooops.xap').then(function () {
            BuildCsproj.getProductFilename(p).then(function (name) {
                t.equal(name, 'Ooops.xap');
                tmp.setGracefulCleanup();
            }).done();
        }).done();
    });
});
