var Q = require('q'),
    path = require('path'),
    fs = require('q-io/fs'),
    pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log'),
    settings = require('../../../../../settings');

module.exports = function (msg) {
    var assemblyPath = path.join(pathHelper.app(), 'platforms', 'wp8', 'Properties', 'AssemblyInfo.cs');
    var product_file_name = msg.localSettings.configurations.wp8[msg.configuration]['product_file_name'];
    var guid = msg.localSettings.configurations.wp8[msg.configuration]['guid'];
    var author = msg.localSettings.author.name;
    var year = (new Date()).getFullYear();
    var v =  (msg.localSettings.configurations.wp8[msg.configuration]['version'] || msg.localSettings.version) + '.0';

    var title = "AssemblyTitle(\"" + product_file_name + "\")";
    var company = "AssemblyCompany(\"" + author + "\")";
    var product = "AssemblyProduct(\"" + product_file_name + "\")";
    var copyright = "AssemblyCopyright(\"Copyright © " + author + " " + year + "\")";
    var trademark = "AssemblyTrademark(\"" + author + "\")";
    var guid =  "Guid(\"" + guid + "\")";
    var version =  "AssemblyVersion(\"" + v + "\")";

    return fs.read(assemblyPath).then(function (assemblyContent) {
        var content = assemblyContent.replace(/AssemblyTitle\(.*\)/, title)
                        .replace(/AssemblyCompany\(.*\)/, company)
                        .replace(/AssemblyProduct\(.*\)/, product)
                        .replace(/AssemblyCopyright\(.*\)/, copyright)
                        .replace(/AssemblyTrademark\(.*\)/, trademark)
                        .replace(/AssemblyVersion\(.*\)/, version)
                        .replace(/Guid\(.*\)/, guid);

        return fs.write(assemblyPath, content);
    }).then(function () {
        log.send('success', '[wp8] changed AssemblyInfo.cs');
        return msg;
    });
};
