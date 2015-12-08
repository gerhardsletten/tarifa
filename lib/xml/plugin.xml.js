var fs = require('fs'),
    xml2js = require('xml2js'),
    parse = require('../helper/xml').parse;

function build(file) {
    return function (xml) {
        var builder = new xml2js.Builder({
            renderOpts: { pretty: true, indent: '    ', newline: '\n' },
            xmldec: { version: '1.0', encoding: 'UTF-8' },
            headless: false
        });
        var xmlString = builder.buildObject(xml);
        fs.writeFileSync(file, xmlString, 'utf-8');
    };
}

function getVersion(filePath) {
    return parse(filePath).then(function (xml) {
        return xml.plugin.$.version;
    });
}

function getId(filePath) {
    return parse(filePath).then(function (xml) {
        return xml.plugin.$.id;
    });
}

function removePlatforms(file, platforms) {
    return parse(file).then(function (xml) {
        xml.plugin.platform = xml.plugin.platform.filter(function (platform) {
            return platforms.indexOf(platform.$.name) < 0;
        });
        return xml;
    }).then(build(file));
}

module.exports.removePlatforms = removePlatforms;
module.exports.getVersion = getVersion;
module.exports.getId = getId;
