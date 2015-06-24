var Q = require('q'),
    find = require('findit'),
    rimraf = require('rimraf'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    fs = require('fs'),
    log = require('../../../../../helper/log'),
    pathHelper = require('../../../../../helper/path'),
    androidPathHelper = require('../../../lib/helper/path'),
    settings = require('../../../../../settings'),
    inferJavaClassNameFromProductName = require('../../../lib/infer-classname'),
    AndroidManifestBuilder = require('../../../lib/xml/AndroidManifest.xml');

module.exports = function (msg) {
    var defer = Q.defer();
    var androidConfs = msg.localSettings.configurations.android;
    var name = androidConfs[msg.configuration]['product_name'] || androidConfs['default']['product_name'] || androidConfs['name'];
    var id = androidConfs[msg.configuration]['id'] || msg.localSettings.id;
    var srcPath = path.join(pathHelper.app(), '/platforms/android/src/');
    var javaActivityTmpl = fs.readFileSync(path.join(__dirname, 'activity.java.tmpl'), 'utf-8');
    var androidManifestXmlPath = androidPathHelper.manifest(pathHelper.app());

    var asbPath = path.join(srcPath, id.replace(/\./g, '/'));
    var activityFiles = Object.keys(androidConfs).filter(function (e) {
        return e !== msg.configuration;
    }).map(function (e) {
        var conf = androidConfs[e];
        return path.join(
            srcPath,
            conf.id.replace(/\./g, '/'),
            inferJavaClassNameFromProductName(conf.product_name) + '.java'
        );
    });
    activityFiles.push(path.join(
      srcPath,
      msg.localSettings.id.replace(/\./g, '/'),
      inferJavaClassNameFromProductName(msg.localSettings.name) + '.java'
    ));

    // we'll only try to delete files that tarifa knows; ie: package names found
    // in tarifa.json
    activityFiles.forEach(function (f) {
        rimraf.sync(f);
    });

    mkdirp(asbPath, function (err) {
        if (err) {
            defer.reject("unable to create package " + asbPath);
        }
        else {
            var inferedName = inferJavaClassNameFromProductName(name);
            var activity = javaActivityTmpl.replace(/\$PACKAGE_NAME/, id).replace(/\$APP_NAME/, inferedName);
            fs.writeFileSync(path.join(asbPath, inferedName + '.java'), activity);
            AndroidManifestBuilder.setActivityInfo(androidManifestXmlPath, inferedName, id);
            log.send('success', '[android] changed main activity');
            defer.resolve(msg);
        }
    });
    return defer.promise;
};
