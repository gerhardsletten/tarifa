var path = require('path');

module.exports.root = path.resolve(__dirname, 'template');
module.exports.pluginXMLPath = path.resolve(__dirname, 'template', 'plugin.xml');
module.exports.files = function (resp) {
    var ret = ['wp8/src/%NAME.cs'];
    if (resp.use_variables) {
        ret.push('wp8/Properties/CDVInstallVariables.xml');
    }
    return ret;
};
