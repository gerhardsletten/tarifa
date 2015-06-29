var fs = require('fs'),
    Q = require('q'),
    format = require('util').format,
    xml2js = require('xml2js'),
    parse = require('../../../../helper/xml').parse;

function has_format(xml, filePath) {
    var defer = Q.defer(),
        err = new Error(format('%s has a wrong format, searching for Deployment xml root', filePath));
    var app = xml.Deployment && xml.Deployment.App;

    if(app && app[0].Tokens[0].PrimaryToken[0].TemplateFlip[0].Title) {
        defer.resolve(xml);
    }
    else { defer.reject(err); }
    return defer.promise;
}

// first region in regions is the default one
function setRegions(file, regions) {
    return parse(file).then(function (xml) {
        return has_format(xml, file).then(function () {
            xml.Deployment.DefaultLanguage[0].$.code = regions[0];
            xml.Deployment.Languages = [{ $: { xmlns: "" }, Language: [] }];
            regions.forEach(function (region) {
                xml.Deployment.Languages[0].Language.push({ $: { code: region }});
            });
            return xml;
        });
    }).then(build(file));
}

function get(filePath) {
    return parse(filePath).then(function (xml) {
        return has_format(xml, filePath).then(function (xml) {
            return {
                title: xml.Deployment.App[0].Tokens[0].PrimaryToken[0].TemplateFlip[0].Title[0],
                guid: xml.Deployment.App[0].$.ProductID.replace(/\{/g, '').replace(/\}/g, ''),
                version: xml.Deployment.App[0].$.Version
            };
        });
    });
}

function set(file, title, guid, version) {
    return parse(file).then(function (xml) {
        return has_format(xml, file).then(function () {
            xml.Deployment.App[0].Tokens[0].PrimaryToken[0].TemplateFlip[0].Title[0] = title;
            xml.Deployment.App[0].$.Title = title;
            xml.Deployment.App[0].$.ProductID = format('{%s}', guid);
            xml.Deployment.App[0].$.Version = version;
            return xml;
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

module.exports.set = set;
module.exports.get = get;
module.exports.setRegions = setRegions;
