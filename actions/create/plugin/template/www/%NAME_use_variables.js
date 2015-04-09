

module.exports.getCordovaInstallVariables = function (success, error) {
    cordova.exec(success, error, '%NAME', 'getCordovaInstallVariables', []);
};