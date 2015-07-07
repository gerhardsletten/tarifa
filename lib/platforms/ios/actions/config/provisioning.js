var Q = require('q'),
    chalk = require('chalk'),
    spinner = require('char-spinner'),
    path = require('path'),
    format = require('util').format,
    log = require('../../../../helper/log'),
    tarifaFile = require('../../../../tarifa-file'),
    pathHelper = require('../../../../helper/path'),
    ask = require('../../../../questions/ask'),
    provisioningList = require('../../lib/nomad/provisioning/list'),
    parseProvision = require('../../lib/parse-mobileprovision'),
    download = require('../../lib/nomad/provisioning/download'),
    install = require('../../lib/nomad/provisioning/install');

function list() {
    return tarifaFile.parse(pathHelper.root()).then(function (localSettings) {
        if(!localSettings.deploy || !localSettings.deploy.apple_id)
            return Q.reject('no apple_id defined in tarifa.json/private.json!');

        var deploy = localSettings.deploy,
            id = deploy.apple_id,
            team = deploy.apple_developer_team;

        return ask.password('What is your apple developer password?').then(function (password) {
            spinner();
            return provisioningList(id, team, password);
        });
    });
}

function printList() {
    return list().then(function (items) {
        log.send('msg', chalk.underline('\nActive provisioning profiles:'));
        items.forEach(function (item) {
            log.send('msg', 'appid: %s name: %s', chalk.yellow(item[1]), chalk.cyan(item[0]));
        });
    });
}

function info(config) {
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
        log.send('msg', '%s %s', chalk.underline('name:'), provision.name);
        log.send('msg', '%s %s', chalk.underline('chalk:'), provision.type);
        log.send('msg', '%s \n\t%s', chalk.underline('uuids:'), provision.uuids.join('\n\t'));
    });
}

function fetch() {
    var root = pathHelper.root();
    return tarifaFile.parse(root, 'ios').then(function (localSettings) {
        if(!localSettings.deploy)
            return Q.reject('no deploy settings');
        return localSettings;
    }).then(function (local) {
        var questions = [
                'apple_password',
                'label',
                'default_apple_developer_identity',
                'default_provisioning_profile_name'
            ],
            response = {
                platforms: ['ios'],
                deploy: true,
                apple_id: local.deploy.apple_id,
                apple_developer_team: local.deploy.apple_developer_team,
                options: {
                    local: local
                }
            };
        return ask(questions.map(function (question) {
            return path.join(__dirname, '../../lib/questions/deploy', question);
        }))(response);
    }).then(function (resp) {
        var downloadDest = pathHelper.resolve(root, format('%s_downloaded.mobileprovision', resp.label));
        resp.downloadDest = downloadDest;
        return download(
            resp.apple_id,
            resp.apple_developer_team,
            resp.password,
            resp.default_provisioning_profile_name,
            downloadDest
        ).then(function () {
            return install(
                downloadDest,
                false
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
    list: printList,
    fetch: fetch,
    info: info
};
