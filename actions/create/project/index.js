var spinner = require('char-spinner'),
    ask = require('../../../lib/questions/ask'),
    questions = require('../../../lib/questions/list'),
    createProject = require('../../../lib/create'),
    banner = require('../../../lib/helper/banner');

function create() {
    banner();

    var initResponse = {
        options: { }
    };

    return ask(questions.project)(initResponse).then(function (response) {
        spinner();
        return response;
    }).then(createProject.createFromResponse);
}

module.exports = create;
