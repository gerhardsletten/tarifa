var path = require('path'),
    settings = require('../settings'),
    project = [
        'project/path',
        'project/id',
        'project/name',
        'project/description',
        'project/author_name',
        'project/author_email',
        'project/author_href',
        'project/platforms',
        'project/plugins',
        'project/www',
        'project/color',
        'deploy/deploy'
    ];

// add platform specific deploy questions
settings.platforms.forEach(function (platform) {
    var mod = path.resolve(__dirname, '../platforms', platform, 'lib/questions');
    project = project.concat(require(mod));
});

project.push('hockeyapp/hockeyapp');
project.push('hockeyapp/token');

module.exports.project = project;

var projectTasks = [
    'tasks/tarifa',
    'tasks/cordova',
    'tasks/patch-cordova-config',
    'tasks/platforms'
].map(function (task) {
    return path.resolve(__dirname, task);
});

// add platform specific project tasks
settings.platforms.forEach(function (platform) {
    var mod = path.resolve(__dirname, '../platforms', platform, 'lib/questions/tasks');
    projectTasks = projectTasks.concat(require(mod));
});

module.exports.projectTasks = projectTasks.concat([
        'tasks/tarifa-file',
        'tasks/plugins',
        'tasks/assets'
    ].map(function (task) { return path.resolve(__dirname, task);})
);

module.exports.plugin = [
    'plugin/path',
    'plugin/id',
    'plugin/name',
    'plugin/platforms',
    'plugin/use_variables',
    'plugin/version',
    'plugin/description',
    'plugin/author_name',
    'plugin/keywords',
    'plugin/license'
];
