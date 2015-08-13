var path = require('path'),
    fs = require('fs'),
    Q = require('q'),
    tmp = require('tmp'),
    BuildCsproj = require('../../../../lib/platforms/wp8/lib/xml/csproj');

describe('[wp8] setting XapFilename tag in wp8/*.csproj', function() {

    var fixture = path.join(__dirname, '../../../fixtures/zanimo_js.csproj');

    it('get XapFilename', function () {
        return BuildCsproj.getProductFilename(fixture).then(function (name) {
            name.should.equal('zanimojsdev.xap');
        });
    });

    it('change XapFilename', function () {
        var xml = fs.readFileSync(fixture, 'utf-8'),
            defer = Q.defer();

        tmp.file(function (err, p) {
            if (err) throw err;
            fs.writeFileSync(p, xml);
            return BuildCsproj.setProductFilename(p, 'Ooops.xap').then(function () {
                return BuildCsproj.getProductFilename(p).then(function (name) {
                    name.should.equal('Ooops.xap');
                    tmp.setGracefulCleanup();
                    defer.resolve();
                }).done();
            });
        });

        return defer.promise;
    });
});
