var path = require('path'),
    fs = require('fs'),
    format = require('util').format,
    catNames = require('cat-names'),
    createProject = require('../../lib/create'),
    createPluginAction = require('../../actions/create/plugin');

function cat() { return catNames.random().replace(/ /g, '_').toLowerCase(); }

module.exports.createProject = function (tmp, projectDefer, responseMockPath, options) {
    options = options || {};
    var mock = path.join(__dirname, '..', 'fixtures', responseMockPath),
        response = JSON.parse(fs.readFileSync(mock, 'utf-8'));

    if(response.keystore_path)
        response.keystore_path = path.join(__dirname, '../fixtures', response.keystore_path);

    return function createTarifaProject() {
        tmp.dir({ template: path.resolve(__dirname, '..', 'tmp', 'tarifa-XXXXXX') }, function (err, dirPath) {

            if(err) return projectDefer.reject(err);
            response.path = path.join(dirPath, response.path);
            response.www = path.resolve(__dirname, '..', '..', 'template', 'project');
            response.name = options.name || cat();
            response.id = options.id || format('%s.%s.%s', cat(), cat(), cat());

            process.chdir(dirPath);
            createProject.createFromResponse(response).then(function (rslt) {
                process.chdir(response.path);
                projectDefer.resolve({ dirPath: dirPath, rslt: rslt, response:response });
            }, function (err) {
                projectDefer.reject(err);
            }).done();
        });
    };
};

module.exports.createPlugin = function (tmp, pluginDefer, responseMockPath) {
    var mock = path.join(__dirname, '..', 'fixtures', responseMockPath),
        response = JSON.parse(fs.readFileSync(mock, 'utf-8')),
        cwd = process.cwd();
    return function createPlugin() {
        tmp.dir({ template: path.resolve(__dirname, '..', 'tmp', 'plugin-XXXXXX') }, function (err, dirPath) {
            if (err) return pluginDefer.reject(err);
            response.path = path.join(dirPath, response.path);
            process.chdir(dirPath);
            createPluginAction.launchTasks(response).then(function (rslt) {
                process.chdir(cwd);
                pluginDefer.resolve({ dirPath: dirPath, rslt: rslt, response:response });
            }, function (err) {
                pluginDefer.reject(err);
            }).done();
        });
    };
};
