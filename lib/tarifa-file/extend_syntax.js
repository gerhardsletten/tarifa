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
 *         "extend": "green"
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
        errMsg = 'Invalid configuration mixin "%s" extended in platform "%s", configuration "%s"';

    var mixins = localSettings.configurations_mixins || {};
    mapConfigurations(localSettings, function(configuration, platformName, configurationName) {
        if (configuration.hasOwnProperty('extend')) {
            if (!mixins.hasOwnProperty(configuration.extend)) {
                errors.push(format(errMsg, configuration.extend, platformName, configurationName));
                return configuration;
            } else {
                return collections.mergeObject(mixins[configuration.extend], configuration, true);
            }
        } else {
            return configuration;
        }
    });

    return errors.length > 0 ? Q.reject(errors.join('\n')) : localSettings;
}

module.exports = extendSyntax;
