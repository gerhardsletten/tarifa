/**
 * patch cordova's config.xml file
 */

var path = require('path'),
    plugins = require('../../cordova/plugins'),
    print = require('../../helper/print'),
    pathHelper = require('../../helper/path'),
    configBuilder = require('../../xml/config.xml');

module.exports = function (response) {
    var configXmlPath = path.join(response.path, 'app/config.xml'),
        allPlugins = plugins.listAll(),
        defaultPlugins = allPlugins.filter(function (p) {
            return p['default'];
        }).map(function (p) {
            return p.value;
        });
    return configBuilder.removePlugins(configXmlPath, defaultPlugins).then(function () {
        if (response.options.verbose) { print.success('patched config.xml'); }
        return response;
    });
};
