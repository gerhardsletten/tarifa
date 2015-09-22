var Q = require('q'),
    chalk = require('chalk'),
    format = require('util').format,
    provisioningList = require('../../nomad/provisioning/list');

var msg = 'Which Provisioning profile do you take to build the %s distribution?';

module.exports = function (type) {
    var question = function (response) {
        var r = response;
        // skip question when no deploy !
        if (!response.deploy || !response.cupertino) {
            return Q({
                dependency: 'ios',
                condition: function () { return false; }
            });
        }
        return provisioningList(r.apple_id, r.apple_developer_team, r.password)
            .then(function (profiles) {
                return {
                    dependency: 'ios',
                    type: 'list',
                    name: format('%s_provisioning_profile_name', type),
                    choices: profiles.map(function (p) { return p[0].trim(); }),
                    message: format(msg, chalk.underline(type))
                };
            });
    };
    question.dependency = 'ios';
    return question;
};
