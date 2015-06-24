/*
 * add cordova platforms task
 */

var pathHelper = require('../../helper/path'),
    platformsLib = require('../../cordova/platforms');

module.exports = function (response) {
    if (!response.platforms.length) return response;

    return platformsLib.add(
        pathHelper.resolve(response.path),
        response.platforms.map(platformsLib.extendPlatform)
    ).then(function() { return response; });
};
