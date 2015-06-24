var Q = require('q'),
    path = require('path'),
    spinner = require("char-spinner"),
    rest = require('restler'),
    chalk = require('chalk'),
    fs = require('fs'),
    format = require('util').format,
    log = require('../helper/log');

// http://support.hockeyapp.net/kb/api/api-apps
// http://support.hockeyapp.net/kb/api/api-versions

function uploadVersion(filePath, conf, hockeyapp_id) {
    if (!fs.existsSync(filePath))
        return Q.reject(format('Package file "%s" not found', filePath));

    var apiUrl = conf.localSettings.hockeyapp.api_url;
    var uploadUrl;
    var defer = Q.defer();
    var params = conf.uploadParams;
    var NOTES = "This build %s was was uploaded via tarifa and upload api";
    var headers = {
        'X-HockeyAppToken': conf.localSettings.hockeyapp.token
    };

    // if conf has already an hockeyapp_id, upload new version, else create a new
    // app and upload a version to it
    if (hockeyapp_id)
        uploadUrl = apiUrl + '/apps/' + hockeyapp_id + '/app_versions/upload';
    else
        uploadUrl = apiUrl + '/apps/upload';

    // get file size (necessary for multipart upload)
    fs.stat(filePath, function(err, stats) {
        if (err) {
            defer.reject(err);
        } else if (stats.isFile()) {
            var fileSize = stats.size,
                notes = format(NOTES, filePath.replace(/^.*[\\\/]/, '')),
                data = {
                    ipa: rest.file(filePath, null, fileSize, null, null),
                    notes: params.notes || notes,
                    notify: params.notify || 0,
                    status: params.status || 1
                };

            log.send(
                'msg',
                'Uploading package "%s" last modified: %s',
                chalk.yellow(path.basename(filePath)),
                chalk.yellow(stats.mtime)
            );

            if (params.tags) data.tags = params.tags;
            if (params.teams) data.teams = params.teams;
            if (params.users) data.users = params.users;
            if (params.commit_sha) data.commit_sha = params.commit_sha;
            if (params.build_server_url) data.build_server_url = params.build_server_url;
            if (params.repository_url) data.repository_url = params.repository_url;

            spinner();

            rest.post(uploadUrl, {
                multipart: true,
                data: data,
                headers: headers
            }).on('complete', function(data, response) {
                if (response.statusCode >= 200 && response.statusCode  < 300) {
                    if (data.public_url) {
                        defer.resolve(data);
                    } else {
                        defer.reject(format(
                            "Some problem occured when uploading to hockeyapp url %s",
                            uploadUrl
                        ));
                    }
                } else {
                    defer.reject(format(
                        "Hockeyap HTTP API ERROR %s (url: %s), failed uploading %s: \n%s",
                        response.statusCode,
                        uploadUrl,
                        path.basename(filePath),
                        JSON.stringify(data.errors)
                    ));
                }
            });
        }
    });
    return defer.promise;
}

function printVersions(versions) {
    if (versions.length === 0) {
        log.send('info', 'no version available');
    }
    else {
        versions.forEach(function (version) {
            log.send('info', chalk.underline("%s - %s"), version.title, version.shortversion);
            log.send('info', '  notes: %s', chalk.gray(version.notes));
            log.send('info', '  config_url: %s', chalk.gray(version.config_url));
            log.send('info', '  restricted_to_tags: %s', chalk.gray(version.restricted_to_tags));
            log.send('info', '  status: %s', chalk.gray(version.status));
            log.send('info', '  tags: %s', chalk.gray(version.tags));
            log.send('info', '  updated_at: %s', chalk.gray(version.updated_at));
            log.send(
                'info',
                '  download_url: %s\n',
                chalk.gray(version.download_url || chalk.bgYellow(chalk.black("(app not released!!!)")))
            );
        });
    }
}

function listVersions(conf) {
    var defer = Q.defer();

    var params = conf.uploadParams;

    var headers = {
        'X-HockeyAppToken': conf.localSettings.hockeyapp.token
    };

    var apiUrl = conf.localSettings.hockeyapp.api_url + '/apps/' +
        conf.hockeyapp_id + '/app_versions';

    spinner();

    rest.get(apiUrl, {
        headers: headers
    }).on('complete', function(data, response) {
        if (response.statusCode >= 200 && response.statusCode  < 300) {
            printVersions(data.app_versions);
            defer.resolve(data);
        } else {
            defer.reject(format("Hockeyap HTTP API ERROR %s, failed to fetch versions!", response.statusCode));
        }
    });

    return defer.promise;
}

function updateVersion(id, conf) {
    var defer = Q.defer();

    var headers = {
        'X-HockeyAppToken': conf.localSettings.hockeyapp.token
    };

    var apiUrl = format("%s/apps/%s/app_versions/%s", conf.localSettings.hockeyapp.api_url, conf.hockeyapp_id, id);

    spinner();

    rest.put(apiUrl, {
        data: conf.uploadParams,
        headers: headers
    }).on('complete', function(data, response) {
        if (response.statusCode >= 200 && response.statusCode  < 300) {
            defer.resolve(data);
        } else {
            defer.reject(format("Hockeyap HTTP API ERROR %s, failed to modify version %s!", response.statusCode, id));
        }
    });

    return defer.promise;
}

function clean(appIds, token, api_url, nbToKeep) {

    var headers = {
        'X-HockeyAppToken': token
    };

    var url = api_url + '/apps/APP_ID/app_versions/delete';

    spinner();

    var promises = appIds.map(function(id) {
        var defer = Q.defer();
        var apiUrl = url.replace('APP_ID', id);
        rest.post(apiUrl, {
            data: { keep: nbToKeep && nbToKeep.toString() || '3' },
            headers: headers
        }).on('complete', function(data, response) {
            if (response.statusCode >= 200 && response.statusCode  < 300) {
                return defer.resolve(data.total_entries);
            } else {
                return defer.reject(format('Deletion failed for app %s', id));
            }
        });
        return defer.promise;
    });

    return Q.all(promises).then(function (results) {
        return results.reduce(function(acc, val) {
            return acc + val;
        }, 0);
    });
}

module.exports = {
    listVersions: listVersions,
    uploadVersion: uploadVersion,
    updateVersion: updateVersion,
    clean: clean
};
