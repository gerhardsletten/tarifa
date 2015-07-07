var Q = require('q'),
    fs = require('q-io/fs'),
    format = require('util').format,
    log = require('../../helper/log'),
    pathHelper = require('../../helper/path'),
    settings = require('../../settings'),
    pkg = require('../../../package.json'),
    builder = require('../../builder');

function makeRootDirectory(response) {
    return fs
      .isDirectory(pathHelper.resolve(response.path))
      .then(function(exist) {
        if(exist) return response;
        return fs.makeDirectory(pathHelper.resolve(response.path))
          .then(function () { return response; });
    });
}

function copyWWWProject(response) {
    return fs
        // create tarifa web app folder
        .makeDirectory(pathHelper.resolve(response.path, settings.webAppPath))
        // copy template project to web app folder
        .then(function () {
            var src = response.www,
                dest = pathHelper.resolve(response.path, settings.webAppPath);
            return fs.copyTree(src, dest);
        })
        .then(function () {
            log.send('success', 'copied template www project');
            return response;
        });
}

function initBuilder(response) {
    return builder.init(pathHelper.resolve(response.path)).then(function () {
        return response;
    }).fail(function () {
        log.send(
            'msg',
            'Try to run tarifa check when your environment is properly configured.'
        );
        return response;
    });
}

function createDotTarifaFile(response) {
    var o = {
            current: pkg.version,
            created: pkg.version
        },
        filePath = pathHelper.resolve(response.path, '.tarifa.json');

    return fs.write(filePath, JSON.stringify(o, null, 2))
        .then(function () { return response; });
}

function createUserCheckScripts(response) {
    var content = 'module.exports = function (msg) {\n    return msg;\n}',
        writeFile = function (platform) {
            var fileName = format('check_%s.js', platform),
                f = pathHelper.resolve(response.path, 'project/bin', fileName);
            return fs.write(f, content);
        };

    return Q.all(response.platforms.map(writeFile)).then(function () {
        return response;
    });
}

module.exports = function (response) {
    if (response.createProjectFromTarifaFile) return Q(response);
    return makeRootDirectory(response)
        .then(copyWWWProject)
        .then(initBuilder)
        .then(createDotTarifaFile)
        .then(createUserCheckScripts)
        .then(function (rsp) {
            log.send(
                'success',
                'project folders created %s',
                pathHelper.resolve(rsp.path)
            );
            return response;
        });
};
