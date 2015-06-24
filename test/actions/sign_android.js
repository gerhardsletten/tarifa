var should = require('should'),
    Q = require('q'),
    tmp = require('tmp'),
    setupHelper = require('../helper/setup'),
    buildAction = require('../../actions/build'),
    tarifaFile = require('../../lib/tarifa-file');

function testSign(projectDefer) {

    describe('sign android app with tarifa', function() {
        it('build android prod should resolve', function () {
            this.timeout(0);
            return projectDefer.promise.then(function (rslt) {
                return tarifaFile.parse(rslt.response.path, 'android', 'prod').then(function (localSettings) {
                    return buildAction.buildƒ({
                        platform: 'android',
                        configuration: 'prod',
                        localSettings: localSettings,
                        keepFileChanges: false,
                        keystore_pass: '123456',
                        keystore_alias_pass: '123456'
                    });
                });
            });
        });
    });
}

if(module.parent.id.indexOf("mocha.js") > 0) {
    var projectDefer = Q.defer();
    before('create tarifa project', setupHelper.createProject(tmp, projectDefer, 'create_project_response_android_sign.json'));
    testSign(projectDefer);
}

module.exports = testSign;
