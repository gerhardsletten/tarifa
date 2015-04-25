var should = require('should'),
    Q = require('q'),
    os = require('os'),
    format = require('util').format,
    tmp = require('tmp'),
    setupHelper = require('../helper/setup'),
    testAction = require('../../actions/test');

function testTest(projectDefer) {

    describe('tarifa test', function() {
        if(os.platform() === 'darwin') {
            it(format("tarifa run ios"), function () {
                this.timeout(0);
                return projectDefer.promise.then(function (rslt) {
                    return testAction.test('ios', 'default', false);
                });
            });
        }

        it(format("tarifa run android"), function () {
            this.timeout(0);
            return projectDefer.promise.then(function (rslt) {
                return testAction.test('android', 'default', false);
            });
        });

    });
}

if(module.parent.id.indexOf("mocha.js") > 0) {
    var projectDefer = Q.defer();
    before('create a empty project', setupHelper.createProject(tmp, projectDefer, format('create_project_response_%s.json', os.platform())));
    testRun(projectDefer);
}

module.exports = testTest;
