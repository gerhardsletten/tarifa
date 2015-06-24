var should = require('should'),
    Q = require('q'),
    tmp = require('tmp'),
    setupHelper = require('../helper/setup'),
    buildAction = require('../../actions/build'),
    tarifaFile = require('../../lib/tarifa-file'),
    pathHelper = require('../../lib/helper/path');

function testSign(projectDefer, certif_path, password) {

    describe('sign wp8 app with tarifa', function() {
        it('build wp8 prod should resolve', function () {
            this.timeout(0);
            return projectDefer.promise.then(function (rslt) {
                return tarifaFile.parse(rslt.response.path, 'wp8', 'prod').then(function (localSettings) {
                    localSettings.signing = { wp8 : { toto : { } } };
                    localSettings.signing.wp8.toto = {
                        certificate_path: certif_path
                    };
                    localSettings.configurations.wp8.prod.release = true;
                    localSettings.configurations.wp8.prod.sign = 'toto';

                    return buildAction.buildƒ({
                        platform: 'wp8',
                        configuration: 'prod',
                        localSettings: localSettings,
                        keepFileChanges: false,
                        wp8_certif_password: password
                    });
                });
            });
        });
    });
}

// usage
// npm run mocha -- test\actions\sign_wp8.js --certificate_path="c:\my.pfx" --password="xxxxxx"

var projectDefer = Q.defer();
before('create tarifa project', setupHelper.createProject(tmp, projectDefer, 'create_project_response_wp8_sign.json'));
testSign(projectDefer, process.argv[3].split('=')[1], process.argv[4].split('=')[1]);
