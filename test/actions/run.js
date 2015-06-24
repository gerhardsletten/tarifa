var should = require('should'),
    Q = require('q'),
    os = require('os'),
    format = require('util').format,
    tmp = require('tmp'),
    setupHelper = require('../helper/setup'),
    runAction = require('../../actions/run'),
    settings = require('../../lib/settings'),
    platformsLib = require('../../lib/cordova/platforms'),
    platformHelper = require('../../lib/helper/platform');


function testRun(projectDefer) {

    describe('tarifa run', function() {

        it(format("tarifa run all dev,default"), function () {
            this.timeout(0);

            var platforms = settings.platforms
                    .map(platformHelper.getName)
                    .filter(platformsLib.isAvailableOnHostSync).filter(function (p) {
                        return p !== 'firefoxos';
                    });

            return projectDefer.promise.then(function (rslt) {
                return runAction.runMultiplePlatforms(platforms, 'dev,default', {});
            });
        });

    });
}

if(module.parent.id.indexOf("mocha.js") > 0) {
    var projectDefer = Q.defer();
    before('create a empty project', setupHelper.createProject(tmp, projectDefer, format('create_project_response_%s.json', os.platform())));
    testRun(projectDefer);
}

module.exports = testRun;
