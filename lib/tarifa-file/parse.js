var path = require('path'),
    Q = require('q'),
    jsonlint = require('jsonlint'),
    fs = require('q-io/fs'),
    existsSync = require('fs').existsSync,
    chalk = require('chalk'),
    format = require('util').format,
    validator = require('../helper/validator'),
    collections = require('../helper/collections'),
    platformHelper = require('../helper/platform'),
    settings = require('../settings'),
    extendSyntax = require('./extend_syntax'),
    checkProjectName = require('./validate/checkProjectName');

function checkSigningLabel(platform, config, attributes, filePaths) {
    return function (o) {
        if(!config || !o.configurations[platform][config]) return o;
        var confObj =  o.configurations[platform][config];
        if(!confObj.sign) return o;
        var label = confObj.sign;

        if(!o.signing[platform][label]) return o;

        var signing = o.signing[platform][label],
            i = 0, l = attributes.length;

        for(; i<l; i++) {
            if(!signing[attributes[i]]){
                return Q.reject(format("%s not found in signing label %s!", attributes[i], label));
            }
            if(signing[attributes[i]]
                && filePaths.indexOf(attributes[i]) > -1
                && !existsSync(signing[attributes[i]])) {
                return Q.reject(format("file not found %s in signing label %s!", signing[attributes[i]], label));
            }
        }
        return o;
    };
}

function checkSigning(platform, config) {
    return function (o) {
        if(!platform || !config) return o;
        var items = require(path.join(__dirname, '../platforms/', platform, 'lib/tarifa-file/signingAttr'));
        return checkSigningLabel(platform, config, items.all, items.files)(o);
    };
}

function checkGlobalSettings(platform, config, root) {
    return function (obj) {

        if(!existsSync(path.resolve(root, settings.cordovaAppPath)))
            return Q.reject(format('Oops %s folder does not exist, call `tarifa check` to regenerate the app folder', settings.cordovaAppPath));
        // allow to override project_output, make sure it's always in conf object
        if(!obj.project_output) obj.project_output = settings.project_output;

        // check for potentials invalid configuration names
        for (var i=0; i < obj.platforms.length; i++) {
            var p = platformHelper.getName(obj.platforms[i]);
            for (var c in obj.configurations[p]) {
                if (obj.configurations[p].hasOwnProperty(c)) {
                    if (!validator.isConfNameValid(c)) {
                        return Q.reject(util.format(
                        'invalid configuration name "%s" for platform "%s".\nConfiguration name %s',
                            c, p, validator.isConfNameValid.error)
                        );
                    }
                }
            }
        }

        if (platform && obj.platforms.map(platformHelper.getName).indexOf(platform) < 0)
            return Q.reject(format('platform %s not described', platform));

        if (platform && !obj.configurations[platform] && !obj.configurations[platform]['default'])
            return Q.reject(format('configuration \'default\' not described for %s platform', platform));

        if (platform && config && !obj.configurations[platform][config])
            return Q.reject(format('configuration %s not described for %s platform', config, platform));

        if (!validator.isVersion(obj.version))
            return Q.reject(format('wrong version format in tarifa.json, only digit.digit.digit format is valid'));

        if (config && obj.configurations[platform][config].version &&
            !validator.isVersion(obj.configurations[platform][config].version))
            return Q.reject(
                format('wrong version format in configuration %s on platform %s: %s',
                config,
                platform,
                chalk.magenta(obj.configurations[platform][config].version)
            ));

        return obj;
    };
}

function checkConfigurationSettings(platform, config) {
    return function (obj) {
        if (platform) {
            var config = config || 'default',
                platformConfs = obj.configurations[platform],
                conf = platformConfs[config],
                def = platformConfs['default'],
                merged = collections.mergeObject(def, conf),
                platformPath = ['configurations', platform, config].join('.');

            if (!validator.isProductName(merged.product_name))
                return Q.reject(format('[%s.product_name] %s', platformPath, validator.isProductName.error));
            if (!validator.isProductFileName(merged.product_file_name.trim())){
                console.log(merged.product_file_name);
                return Q.reject(format('[%s.product_file_name] %s', platformPath, validator.isProductFileName.error));
            }

            var platformSpecificCheck = path.join(__dirname, '../platforms/', platform, 'lib/tarifa-file/checkConfigurationSettings');
            return require(platformSpecificCheck)(obj, platformPath);
        }
        return obj;
    };
}

function parseJSON(filename, src) {
    try {
        return jsonlint.parse(src);
    } catch(err) {
        throw filename + " " + err.message;
    }
}

function id(i) { return i; }

/*
 * parse tarifa.json files for a given platform
 */

module.exports = function (dirname, platform, config, nocheck, noextend) {
    var publicPath = path.join(dirname, settings.publicTarifaFileName),
        privatePath = path.join(dirname, settings.privateTarifaFileName);
    return Q.all([
        fs.isFile(publicPath),
        fs.isFile(privatePath)
    ]).spread(function (publicFileExists, privateFileExists) {
        if(!publicFileExists)
            return Q.reject(format('%s file does not exist!', settings.publicTarifaFileName));

        return Q.all([
            fs.read(publicPath),
            privateFileExists ? fs.read(privatePath) : Q.resolve('{}')
        ]);
    })
    .spread(function (publicSettings, privateSettings) {
        var publicObj = parseJSON(settings.publicTarifaFileName, publicSettings),
            privateObj = parseJSON(settings.privateTarifaFileName, privateSettings),
            mergedObj = collections.mergeObject(publicObj, privateObj, true),
            oneLvlPrivateObj = collections.toOneLevelObject(privateObj),
            descriptor = {
                configurable: false,
                enumerable: false,
                value: collections.mapValues(oneLvlPrivateObj, function (val) { return true; }),
                writable: false
            };
        Object.defineProperty(mergedObj, 'tarifa:userPrivateKeys', descriptor);
        return mergedObj;
    })
    .then(noextend ? id : extendSyntax)
    // validate settings globally
    .then(nocheck ? id : checkGlobalSettings(platform, config, dirname))
    // check if name match native app name
    .then(nocheck ? id : checkProjectName(dirname, platform))
    // validate platform specific settings
    .then(nocheck ? id : checkConfigurationSettings(platform, config))
    .then(nocheck ? id : checkSigning(platform, config));
};
