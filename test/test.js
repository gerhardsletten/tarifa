var should = require('should'),
    Q = require('q'),
    os = require('os'),
    fs = require('fs'),
    format = require('util').format,
    path = require('path'),
    tmp = require('tmp'),
    setupHelper = require('./helper/setup');

module.exports = function (options) {
    describe(format('testing tarifa cli on %s', os.platform()), function() {

        var projectDefer = Q.defer(),
            pluginDefer = Q.defer(),
            pluginWithVariablesDefer = Q.defer(),
            wait = function (t) {
                describe('waiting ' + (t || 1) + 's', function () {
                    it('', function () {
                        this.timeout(0);
                        return projectDefer.promise.then(function (rslt) {
                            return Q.delay((t || 1) * 1000);
                        });
                    });
                });
            };

        before('create project', setupHelper.createProject(tmp, projectDefer, format('create_project_response_%s.json', os.platform())));

        wait();

        before('create plugin', setupHelper.createPlugin(tmp, pluginDefer, 'create_plugin_response.json'));

        it('create plugin', function () {
            this.timeout(0);
            return pluginDefer.promise;
        });

        before('create plugin with variables', setupHelper.createPlugin(tmp, pluginWithVariablesDefer, 'create_plugin_with_variables_response.json'));
        it('create plugin with variables', function () {
            this.timeout(0);
            return pluginWithVariablesDefer.promise;
        });

        require('./actions/config')(projectDefer, options);
        wait();
        require('./actions/info')(projectDefer, options);
        wait();
        require('./actions/prepare')(projectDefer, options);
        wait();
        require('./actions/build')(projectDefer, options);
        wait(5);
        require('./actions/clean')(projectDefer, options);
        wait();
        require('./actions/check')(projectDefer, options);
        wait();
        require('./actions/platform')(projectDefer, options);
        if(options.run) {
            wait();
            require('./actions/run')(projectDefer, options);
            wait();
            require('./actions/test')(projectDefer, options);
        }
    });
};
