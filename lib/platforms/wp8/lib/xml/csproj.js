var fs = require('fs'),
    Q = require('q'),
    format = require('util').format,
    xml2js = require('xml2js'),
    parse = require('../../../../helper/xml').parse;

function has_XapFilename(xml, filePath) {
    var defer = Q.defer(),
        err = new Error(format('Can\'t find XapFilename tag %s', filePath));

    if(xml.Project && xml.Project.PropertyGroup && xml.Project.PropertyGroup[0].XapFilename)
        defer.resolve({ value: xml.Project.PropertyGroup[0].XapFilename[0], xml: xml});
    else defer.reject(err);
    return defer.promise;
}

function get(filePath) {
    return parse(filePath).then(function (xml) {
        return has_XapFilename(xml, filePath).then(function (result) {
            return result.value;
        });
    });
}

function set(file, name) {
    return parse(file).then(function (xml) {
        return has_XapFilename(xml, file).then(function (result) {
            result.xml.Project.PropertyGroup[0].XapFilename[0] = name;
            return result.xml;
        });
    }).then(build(file));
}

function build(file) {
    return function (xml) {
        var builder = new xml2js.Builder({
            renderOpts: { pretty: true, indent: '    ', newline: '\n' },
            headless: true
        });
        var xmlString = builder.buildObject(xml);
        fs.writeFileSync(file, "<?xml version='1.0' encoding='utf-8'?>\n" + xmlString, 'utf-8');
    };
}

module.exports.setProductFilename = set;
module.exports.getProductFilename = get;
