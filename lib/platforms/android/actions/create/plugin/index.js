var path = require('path');

module.exports.root = path.resolve(__dirname, 'template');
module.exports.pluginXMLPath = path.resolve(__dirname, 'template/plugin.xml');
module.exports.files = function (resp) {
    var ret = ['android/src/%NAME.java'];
    if (resp.use_variables) {
        ret.push('android/res/values/cdv_install_variables.xml');
    }
    return ret;
};
