var should = require('should'),
    Q = require('q'),
    os = require('os'),
    format = require('util').format,
    tmp = require('tmp'),
    rimraf = require('rimraf'),
    path = require('path'),
    settings = require('../../lib/settings'),
    setupHelper = require('../helper/setup'),
    checkAction = require('../../actions/check');

function testCheck(projectDefer) {
    describe('tarifa check', function() {
        it('should not fail with a working project', function () {
            this.timeout(0);
            return projectDefer.promise.then(function (rslt) {
                return checkAction.check(false);
            });
        });
        it('should not fail after removing the `app` and `images` folder', function () {
            this.timeout(0);
            return projectDefer.promise.then(function (rslt) {
                rimraf.sync(path.resolve(rslt.dirPath, settings.cordovaAppPath));
                rimraf.sync(path.resolve(rslt.dirPath, settings.images));
                return checkAction.check(false, true);
            });
        });
        it('should not fail when used with --force', function () {
            this.timeout(0);
            return projectDefer.promise.then(function (rslt) {
                return checkAction.check(true, true);
            });
        });
    });
}

if(module.parent.id.indexOf("mocha.js") > 0) {
    var projectDefer = Q.defer();
    before('create a empty project', setupHelper.createProject(tmp, projectDefer, format('create_project_response_%s.json', os.platform())));
    testCheck(projectDefer);
}

module.exports = testCheck;
