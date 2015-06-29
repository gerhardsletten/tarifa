var fs = require('fs'),
    Q = require('q'),
    format = require('util').format,
    xml2js = require('xml2js'),
    collectionsHelper = require('../../../../helper/collections'),
    parse = require('../../../../helper/xml').parse;

function getActivityInfo(file) {
    return parse(file).then(function (xml) {
        return {
            name : xml.manifest.application[0].activity[0].$['android:name'],
            id : xml.manifest.$['package']
        };
    });
}

function setActivityInfo(file, name, id) {
    return parse(file).then(function (xml) {
        xml.manifest.application[0].activity[0].$['android:name'] = name;
        if(id) xml.manifest.$['package'] = id;
        return xml;
    }).then(build(file));
}

function setVersionCode(file, code) {
    return parse(file).then(function (xml) {
        xml.manifest.$['android:versionCode'] = code;
        return xml;
    }).then(build(file));
}

function setMinSdkVersion(file, version) {
    return parse(file).then(function (xml) {
        xml.manifest['uses-sdk'].forEach(function (el) {
            el.$['android:minSdkVersion'] = version;
        });
        return xml;
    }).then(build(file));
}

function merge(file, xmlObj) {
    return parse(file).then(function (xmlInit) {
        return collectionsHelper.mergeObject(xmlInit, xmlObj, true);
    }).then(build(file));
}

function build(file) {
    return function (xml) {
        var builder = new xml2js.Builder({
            renderOpts: { pretty: true, indent: '    ', newline: '\n' },
            headless: true
        });
        var xmlString = builder.buildObject(xml);
        fs.writeFileSync(file, xmlString, 'utf-8');
    };
}

module.exports.getActivityInfo = getActivityInfo;
module.exports.setActivityInfo = setActivityInfo;
module.exports.setVersionCode = setVersionCode;
module.exports.setMinSdkVersion = setMinSdkVersion;
module.exports.merge = merge;
