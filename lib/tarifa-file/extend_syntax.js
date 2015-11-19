var Q = require('q'),
    collections = require('../helper/collections'),
    platformHelper = require('../helper/platform'),
    format = require('util').format;

/**
 * Map all configurations for all platforms with a callback function.
 *
 * `localSettings` tarifa configuration
 * `callback` Called with three arguments: configuration, platform name
 *            and configuration name. Expects a configuration in return.
 */

function mapConfigurations(localSettings, callback) {
    var platforms = (localSettings.platforms || []).map(platformHelper.getName),
        configs = localSettings.configurations || {};
    platforms.forEach(function(platform) {
        if (configs[platform]) {
            Object.keys(configs[platform]).forEach(function(configurationName) {
                configs[platform][configurationName] = callback(configs[platform][configurationName], platform, configurationName);
            });
        }
    });
}

function merge(mixins, arr) {
    return arr.map(function (label) {
        return mixins[label];
    }).reduce(collections.deepMergeObject, {});
}

function available(mixins, labels) {
    return labels.reduce(function (rslt, label) {
        return !mixins.hasOwnProperty(label) ? false : rslt;
    }, true);
}

/**
 * Implement "extend" attribute inside configurations objects.
 * It allows to extend objects defined in "configurations_mixins".
 *
 * {
 *   "configurations_mixins": {
 *     "green": {
 *       assets_path: "images/green"
 *     }
 *   },
 *   "configurations": {
 *     "ios": {
 *       "green_dev": {
 *         "extend": "green"  // can be a string or an array of strings
 *       }
 *     }
 *   }
 * }
 *
 * Will result in an extended configuration
 * { ..
 *   "configurations": {
 *     "ios": {
 *       "green_dev": {
 *         "extend": "green",
 *         "assets_path": "images/green"
 *       }
 *     }
 *   }
 * }
 */

function extendSyntax(localSettings) {
    var errors = [],
        errMsg = 'Invalid configuration mixin "%s" extended in platform "%s", configuration "%s"',
        mixins = localSettings.configurations_mixins || {};

    mapConfigurations(localSettings, function(conf, platformName, confName) {
        if (conf.hasOwnProperty('extend')) {
            var labels = Array.isArray(conf.extend) ? conf.extend : [conf.extend];
            if (!available(mixins, labels)) {
                errors.push(format(errMsg, labels.join(', '), platformName, confName));
                return conf;
            } else {
                return collections.mergeObject(merge(mixins, labels), conf, true);
            }
        } else {
            return conf;
        }
    });

    return errors.length > 0 ? Q.reject(errors.join('\n')) : localSettings;
}

module.exports = extendSyntax;
