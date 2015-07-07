var Q = require('q'),
    getAliases = require('../../keystore').list;

var question = function (resp) {
    if(!resp.deploy || !resp.keystore_reuse) {
        return Q({
            dependency: 'android',
            condition: function () { return false; }
        });
    }
    return getAliases(resp.keystore_path, resp.keystore_storepass).then(function (aliases) {
        return {
            dependency: 'android',
            type: 'list',
            name: 'keystore_alias',
            choices: aliases,
            message: 'Which alias would you like to use?'
        };
    });
};

question.dependency = 'android';
module.exports = question;
