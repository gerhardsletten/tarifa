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
            pluginWithVariablesDefer = Q.defer();
        before('create project', setupHelper.createProject(tmp, projectDefer, format('create_project_response_%s.json', os.platform())));
        it('create project', function () {
            this.timeout(0);
            return projectDefer.promise;
        });
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
        require('./actions/plugins')(projectDefer, pluginDefer, pluginWithVariablesDefer, options);
        require('./actions/info')(projectDefer, options);
        require('./actions/prepare')(projectDefer, options);
        require('./actions/build')(projectDefer, options);
        require('./actions/clean')(projectDefer, options);
        require('./actions/check')(projectDefer, options);
        require('./actions/platform')(projectDefer, options);
        require('./actions/platform_version')(projectDefer, options);
        require('./actions/update')(projectDefer, options);

        if(options.run) require('./actions/run')(projectDefer, options);
    });
};
