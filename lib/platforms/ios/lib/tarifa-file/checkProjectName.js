var Q = require('q'),
    fs = require('q-io/fs'),
    path = require('path'),
    format = require('util').format;

module.exports = function check_ios(cordova_root, obj) {
    var project_folder = path.join(cordova_root, 'platforms', 'ios', obj.name),
        xcodeproj_path = format('%s.%s', project_folder, 'xcodeproj');

    return Q.all([fs.exists(project_folder), fs.exists(xcodeproj_path)])
        .spread(function (project_folder_exists, xcodeproj_path_exists) {
            if(!project_folder_exists || !xcodeproj_path_exists)
                return Q.reject(format('No xcode project named %s, change tarifa.json name attribute!', obj.name));
            else return obj;
        });
};
