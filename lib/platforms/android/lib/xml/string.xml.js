var fs = require('fs'),
    Q = require('q'),
    format = require('util').format,
    xml2js = require('xml2js'),
    parse = require('../../../../helper/xml').parse;

function has_app_name(xml, filePath) {
    var defer = Q.defer(),
        err = new Error(format('Can\'t find string app_name in %s', filePath));
    if(xml.resources && xml.resources.string) {
        var obj;
        for(var i = 0; i < xml.resources.string.length; i++) {
            obj = xml.resources.string[i];
            if(obj.$ && obj.$.name === 'app_name') {
                defer.resolve({
                    xml: xml,
                    index: i
                });
                return defer.promise;
            }
        }
        defer.reject(err);
    }
    else {
        defer.reject(err);
    }

    return defer.promise;
}

function get_app_name(file) {
    return parse(file).then(function (xml) {
        return has_app_name(xml, file).then(function (result) {
            return result.xml.resources.string[result.index]._;
        });
    });
}

function build(file) {
    return function (xml) {
        var builder = new xml2js.Builder({
            renderOpts: { pretty: true, indent: '    ', newline: '\n' },
            xmldec: { version: '1.0', encoding: 'UTF-8' },
            headless: true
        });
        var xmlString = '<?xml version=\'1.0\' encoding=\'utf-8\'?>\n' + builder.buildObject(xml);
        fs.writeFileSync(file, xmlString, 'utf-8');
    };
}

function change_app_name(file, name) {
    return parse(file).then(function (xml) {
        return has_app_name(xml, file).then(function (result) {
            result.xml.resources.string[result.index]._ = name;
            return result.xml;
        });
    }).then(build(file));
}

module.exports.getAppName = get_app_name;
module.exports.changeAppName = change_app_name;
