var Q = require('q'),
    path = require('path'),
    pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log'),
    mergeObject = require('../../../../../helper/collections').mergeObject,
    ConfigBuilder = require('../../../../../xml/config.xml');

module.exports = function (msg) {
    var local = msg.localSettings,
        conf = local.configurations[msg.platform][msg.configuration],
        config_xml_path = path.join(pathHelper.app(), 'config.xml');

    return ConfigBuilder.setName(
        config_xml_path,
        conf.product_name
    ).then(function () {
        log.send('success', 'modifying project name in config.xml');
        return msg;
    }, function(err) {
        log.send('error', 'Error when trying to modify config.xml: ' + err);
        return Q.reject(err);
    });
};