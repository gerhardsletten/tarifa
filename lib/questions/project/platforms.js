var path = require('path'),
    platforms = require('../../../lib/cordova/platforms');

var question = function () {
    return platforms.installedPlatforms().then(function (choices) {
        return {
            type: 'checkbox',
            name: 'platforms',
            choices: choices.map(function (choice) {
                var name = require(path.resolve(__dirname, '../../platforms', choice.value, 'package.json')).name;
                return {
                    name: name,
                    value: choice.value
                };
            }),
            validate: function (answer) {
                return answer.length > 0 || 'one platform mandatory!';
            },
            message: 'Choose platforms?'
        };
    });
};

module.exports = question;
