var Q = require('q'),
    chalk = require('chalk'),
    spinner = require("char-spinner"),
    format = require('util').format,
    print = require('../../../../helper/print'),
    tarifaFile = require('../../../../tarifa-file'),
    pathHelper = require('../../../../helper/path'),
    ask = require('../../../../questions/ask'),
    provisioningList = require('../../lib/nomad/provisioning/list'),
    parseProvision = require('../../lib/parse-mobileprovision'),
    download = require('../../lib/nomad/provisioning/download'),
    install = require('../../lib/nomad/provisioning/install');

function list(verbose) {
    return tarifaFile.parse(pathHelper.root()).then(function (localSettings) {
        if(!localSettings.deploy || !localSettings.deploy.apple_id)
            return Q.reject('no apple_id defined in tarifa.json/private.json!');

        var deploy = localSettings.deploy,
            id = deploy.apple_id,
            team = deploy.apple_developer_team;

        return ask.password('What is your apple developer password?').then(function (password) {
            spinner();
            return provisioningList(id, team, password, verbose);
        });
    });
}

function printList(verbose) {
    return list(verbose).then(function (items) {
        print(chalk.underline("\nActive provisioning profiles:"));
        items.forEach(function (item) {
            print("appid: %s name: %s", chalk.yellow(item[1]), chalk.cyan(item[0]));
        });
    });
}

function info(config, verbose) {
    var root = pathHelper.root();
    config = config || 'default';
    return tarifaFile.parse(root, 'ios', config).then(function (localSettings) {
        if(!localSettings.configurations.ios[config].sign)
            return Q.reject(format('no signing settings in configuration %s', config));
        return {
            local: localSettings,
            label: localSettings.configurations.ios[config].sign
        };
    }).then(function (msg) {
        return parseProvision(msg.local.signing.ios[msg.label].provisioning_path);
    }).then(function (provision) {
        print('%s %s', chalk.underline('name:'), provision.name);
        print('%s %s', chalk.underline('chalk:'), provision.type);
        print('%s \n\t%s', chalk.underline('uuids:'), provision.uuids.join('\n\t'));
    });
}

function fetch(verbose) {
    var root = pathHelper.root();
    return tarifaFile.parse(root, 'ios').then(function (localSettings) {
        if(!localSettings.deploy)
            return Q.reject('no deploy settings');
        return localSettings;
    }).then(function (local) {
        var questions = [
                'deploy/ios/apple_password',
                'deploy/ios/label',
                'deploy/ios/default_apple_developer_identity',
                'deploy/ios/default_provisioning_profile_name'
            ],
            response = {
                apple_id: local.deploy.apple_id,
                apple_developer_team: local.deploy.apple_developer_team,
                options : {
                    verbose : verbose,
                    local: local
                }
            };
        return ask(questions)(response);
    }).then(function (resp) {
        var downloadDest = pathHelper.resolve(root, format('%s_downloaded.mobileprovision', resp.label));
        resp.downloadDest = downloadDest;
        return download(
            resp.apple_id,
            resp.apple_developer_team,
            resp.password,
            resp.default_provisioning_profile_name,
            downloadDest,
            resp.options.verbose
        ).then(function () {
            return install(
                downloadDest,
                false,
                resp.options.verbose
            );
        }).then(function () { return resp; });
    }).then(function (resp) {
        return tarifaFile.parse(root, null, null, true, true).then(function (obj) {
          obj.signing = resp.options.local.signing || {};
          obj.signing.ios = resp.options.local.signing.ios || {};
          obj.signing.ios[resp.label] = {
              identity: resp.default_apple_developer_identity,
              provisioning_path: resp.downloadDest,
              provisioning_name: resp.default_provisioning_profile_name
          };
          return tarifaFile.write(root, obj);
        });
    });
}

module.exports = {
    list : printList,
    fetch: fetch,
    info: info
};
