var Q = require('q'),
    path = require('path'),
    spinner = require('char-spinner'),
    ask = require('../../../lib/questions/ask'),
    questions = require('../../../lib/questions/list'),
    createProject = require('../../../lib/create'),
    banner = require('../../../lib/helper/banner'),
    pathHelper = require('../../../lib/helper/path'),
    validator = require('../../../lib/helper/validator'),
    isNonExistingOrEmptyFolderPath = validator.isNonExistingOrEmptyFolderPath,
    isProjectId = validator.isProjectId,
    isName = validator.isJavaIdentifier;

function isInteractive(options) {
    return Q(!options.path && !options.name && !options.id);
}

function check(options) {

    options.path = options.path.toString();

    var validPath = isNonExistingOrEmptyFolderPath(pathHelper.resolve(options.path)),
        validId = isProjectId(options.id),
        validName = isName(options.name),
        errMsg = [];

    if(validPath && validId && validName) { return Q(); }
    else {
        if(!validPath) errMsg.push('path ' + isNonExistingOrEmptyFolderPath.error);
        if(!validId) errMsg.push('id ' + isProjectId.error);
        if(!validName) errMsg.push('name ' + isName.error);
        errMsg.push('read `tarifa create --help` for usage');
        return Q.reject(errMsg.join('\n'));
    }
}

function create(options) {
    banner();

    var initResponse = {
        options: { },
        path: null,
        id: 'tools.tarifa',
        name: 'emptyProject',
        description: 'empty tarifa project',
        author_name: 'project author',
        author_email: 'author email',
        author_href: 'author href',
        platforms: [],
        plugins: [],
        www: path.resolve(__dirname, '../../../template/project'),
        color: 'blue',
        deploy: false
    };

    return isInteractive(options).then(function (interactive) {
        if(interactive) return ask(questions.project)(initResponse);
        else return check(options).then(function () {
            initResponse.path = options.path;
            initResponse.name = options.name;
            initResponse.id = options.id;
            return initResponse;
        });
    }).then(function (response) {
        spinner();
        return response;
    }).then(createProject.createFromResponse);
}

create.check = check;
create.isInteractive = isInteractive;
module.exports = create;
