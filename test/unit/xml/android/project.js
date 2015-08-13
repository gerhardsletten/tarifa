var path = require('path'),
    projectXML = require('../../../../lib/platforms/android/lib/xml/project');

describe('[android] get project name in app/platforms/android/.project', function() {
    it('get project name', function () {
        var file = path.join(__dirname, '../../../fixtures/project');
        return projectXML.getProjectName(file).then(function (name) {
            name.should.equal('toto');
        });
    });
});
