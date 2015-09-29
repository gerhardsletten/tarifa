var test = require('tape'),
    fs = require('fs'),
    path = require('path'),
    helpers = require('../../helpers'),
    tarifaFile = require('../../../lib/tarifa-file');

// TODO
// tarifaFile.write(response) => Promise[response]
// tarifaFile.checkPlatforms(platformNames, parsedSettings) => Promise[platformNames]
// tarifaFile.checkConfigurations(configurations, platformName, parsedSettings) => Promise[configurations]
// tarifaFile.getPlatformConfigs(parsedSettings, platformName) => configurationsObject
// tarifaFile.addHockeyappId(dirname, platform, config, hockeyappId) => Promise[settingsObject]
// tarifaFile.removePlatforms(dirname, platforms) => Promise[settingsObject]
// tarifaFile.removePlatform(dirname, platform) => Promise[settingsObject]
// tarifaFile.addPlatforms(dirname, platforms) => Promise[settingsObject]
// tarifaFile.addPlatform(dirname, platform) => Promise[settingsObject]
// tarifaFile.removePlugin(dirname, name) => Promise[name]
// tarifaFile.addPlugin(dirname, name, uri, variables) => Promise[name]
// tarifaFile.parse(dirname, platform, config, nocheck, noextend) => Promise[settingsObject]

var responseFixture = {
      path: path.join(__dirname, '..', '..', 'tmp'),
      id: 'oops.ooops.oops',
      name: 'super-app',
      description: 'this is a test',
      author_name: 'Mister Ooops',
      author_email: 'oops@blablabla.bla',
      author_href: 'http://blablablabla.bla',
      platforms: [
        'ios',
        'android',
        'browser',
        'firefoxos'
      ],
      plugins: [],
      www: 'template/project',
      color: 'blue',
      deploy: false,
      hockeyapp: false
    },
    tarifaMock = fs.readFileSync(path.join(__dirname, '..', '..', 'fixtures', 'tarifa.json.fixture'), 'utf-8');

test('create a tarifa.json file', function (t) {
    t.plan(4);

    tarifaFile.createFromResponse(responseFixture).then(function () {
        t.ok(helpers.isFile(responseFixture.path, 'tarifa.json'), 'tarifa.json file exists');
        t.ok(helpers.isFile(responseFixture.path, 'private.json'), 'private.json file exists');
        t.equal(fs.readFileSync(path.join(responseFixture.path, 'private.json'), 'utf-8'), '{}', 'private.json contains an empty object');
        t.equal(fs.readFileSync(path.join(responseFixture.path, 'tarifa.json'), 'utf-8'), tarifaMock, 'tarifa.json valid content');
    });
});
