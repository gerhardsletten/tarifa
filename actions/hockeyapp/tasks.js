var Q = require('q'),
    fs = require('q-io/fs'),
    path = require('path'),
    format = require('util').format,
    tarifaFile = require('../../lib/tarifa-file'),
    pathHelper = require('../../lib/helper/path'),
    collsHelper = require('../../lib/helper/collections'),
    argsHelper = require('../../lib/helper/args'),
    hockeyapp = require('../../lib/hockeyapp/hockeyapp'),
    log = require('../../lib/helper/log');

var mergeParams = function (localSettings, argv) {
    // check for hockeyapp options in conf
    var params = collsHelper.mapKeys(collsHelper.filterKeys(localSettings.hockeyapp, function (e) {
            return [
                'versions_notify',
                'versions_status',
                'versions_tags',
                'versions_teams',
                'versions_users',
                'versions_commit_sha',
                'versions_build_server_url',
                'versions_repository_url'
                ].indexOf(e) > -1;
        }), function (e) {
            return e.replace(/^versions_/, '');
        }),
        // get relevant options in cmd args
        opts = collsHelper.filterKeys(argv, function(e) {
            return ['notes', 'notify', 'status', 'tags', 'teams', 'users',
                'commit_sha', 'build_server_url', 'repository_url'].indexOf(e) > -1;
        });

    return {
        localSettings: localSettings,
        uploadParams: collsHelper.mergeObject(params, opts)
    };
};

var upload = function (msg) {
    var config = msg.config,
        platform = msg.platform,
        localSettings = msg.localSettings,
        envSettings = localSettings.configurations[platform][config],
        hockeyapp_id = envSettings.hockeyapp_id;

    if (!localSettings.hockeyapp || !localSettings.hockeyapp.api_url || !localSettings.hockeyapp.token)
        return Q.reject('No hockeyapp informations are available in the current tarifa.json file.');

    // check for hockeyapp options in conf
    var conf = mergeParams(localSettings, msg.argv),
        productFileName = pathHelper.productFile(
            platform,
            envSettings.product_file_name,
            envSettings.release
        );

    return hockeyapp.uploadVersion(productFileName, conf, hockeyapp_id).then(function (data) {
        log.send(
            'success',
            'Uploaded new package "%s" successfully.\nSee new version at %s',
            path.basename(productFileName),
            data.public_url
        );
        // in case of app creation, add 'hockeyapp_id' to configuration
        if (data.public_identifier) {
            return tarifaFile.addHockeyappId(pathHelper.root(), platform, config, data.public_identifier).then(function() {
                 log.send('success', 'Created hockeyapp application successfully.');
            });
        }
    });
};

var clean = function (msg, nbToKeep) {
    var localSettings = msg.localSettings,
        appIds = collsHelper.findByKey(localSettings, 'hockeyapp_id');

    if(!localSettings.hockeyapp)
        return Q.reject('no `hockeyapp` attribute in tarifa.json');
    if(!localSettings.hockeyapp.token)
        return Q.reject('no `token` on `hockeyapp` attribute in tarifa.json');
    if(!localSettings.hockeyapp.api_url)
        return Q.reject('no `api_url` on `hockeyapp` attribute in tarifa.json');

    return hockeyapp.clean(
            appIds,
            localSettings.hockeyapp.token,
            localSettings.hockeyapp.api_url,
            nbToKeep
    ).then(function (total) {
        log.send(
            'success',
            'Successfully deleted %s version(s). Notice: deletion is asynchronous and version may still appear in listings for a while.',
            total
        );
    });
};

var updateLast = function (msg) {
    var config = msg.config,
        platform = msg.platform,
        argv = msg.argv;

    return tarifaFile.parse(pathHelper.root(), platform, config).then(function (localSettings) {
        var envSettings = localSettings.configurations[platform][config],
            hockeyapp_id = envSettings.hockeyapp_id;

        if (!hockeyapp_id)
            return Q.reject(format('No hockeyapp_id key is available in %s for platform %s', config, platform));

        if (!localSettings.hockeyapp || !localSettings.hockeyapp.api_url || !localSettings.hockeyapp.token)
            return Q.reject('No hockeyapp informations are available in the current tarifa.json file.');

        var conf = {
            localSettings: localSettings,
            hockeyapp_id: hockeyapp_id,
            // get relevant options in cmd args
            uploadParams: collsHelper.filterKeys(argv, function(e) {
                return ['notes', 'notify', 'status', 'tags', 'teams', 'users'].indexOf(e) > -1;
            })
        };

        return hockeyapp.listVersions(conf, false).then(function (list) {
            return hockeyapp.updateVersion(list.app_versions[0].id, conf).then(function () {
                log.send('success', 'Updated version successfully.');
            });
        });
    });
};

var list = function(msg) {
    var config = msg.config,
        platform = msg.platform;

    return tarifaFile.parse(pathHelper.root(), platform, config).then(function (localSettings) {
        var envSettings = localSettings.configurations[platform][config],
            hockeyConf = localSettings.hockeyapp,
            hockeyapp_id = envSettings.hockeyapp_id;

        if (!hockeyapp_id)
            return Q.reject(format('No hockeyapp_id key is available in %s for platform %s', config, platform));

        if (!hockeyConf || !hockeyConf.api_url || !hockeyConf.token)
            return Q.reject('Incomplete or no `hockeyapp` attribute  on tarifa.json file.');

        return hockeyapp.listVersions({
            localSettings: localSettings,
            hockeyapp_id: hockeyapp_id
        }, true);
    });
};

module.exports.list = list;
module.exports.upload = upload;
module.exports.clean = clean;
module.exports.updateLast = updateLast;
