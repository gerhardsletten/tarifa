var parse = require('../../../../helper/xml').parse;

function getProjectName(file) {
    return parse(file).then(function (xml) {
        return xml.projectDescription.name[0];
    });
}

module.exports.getProjectName = getProjectName;
