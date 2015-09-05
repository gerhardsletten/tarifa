// unit tests
require('./unit/xml/config.xml');
require('./unit/xml/android/string.xml');
require('./unit/xml/android/project');
require('./unit/xml/android/AndroidManifest.xml');
require('./unit/xml/wp8/csproj');
require('./unit/xml/wp8/WMAppManifest.xml');
require('./unit/tarifa-file/extend_tests');
// cli tests by actions
require('./cli/noargs');
require('./cli/option-version');
require('./cli/create');
// FIXME require('./cli/prepare');
// FIXME require('./cli/platform');
// FIXME require('./cli/plugin');
// FIXME require('./cli/build');
// FIXME require('./cli/run');
require('./cli/info');
// FIXME require('./cli/device');
// FIXME require('./cli/config');
// FIXME require('./cli/check');
// FIXME require('./cli/clean');
// FIXME require('./cli/hockeyapp');
// FIXME require('./cli/update');
// FIXME require('./cli/watch');
// FIXME require('./cli/test');

var rimraf = require('rimraf'),
    path = require('path'),
    fs = require('fs');

require('tape')('clean tmp folder', function (t) {
    t.plan(1);
    rimraf.sync(path.resolve(__dirname, 'tmp'));
    fs.mkdirSync(path.resolve(__dirname, 'tmp'));
    fs.closeSync(fs.openSync(path.resolve(__dirname, 'tmp', '.gitkeep'), 'w'));
    t.equal(fs.readdirSync(path.resolve(__dirname, 'tmp')).length, 1);
});
