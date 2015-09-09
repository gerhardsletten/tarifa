var path = require('path'),
    test = require('tape'),
    projectXML = require('../../../../lib/platforms/android/lib/xml/project');

test('unit: parse app/platforms/android/.project and extract project name', function(t) {
    t.plan(1);
    var file = path.join(__dirname, '../../../fixtures/project');
    projectXML.getProjectName(file).then(function (name) {
        t.equal(name, 'toto');
    });
});
