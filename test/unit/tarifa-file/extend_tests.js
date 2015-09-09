var test = require('tape'),
    Q = require('q'),
    extendSyntax = require('../../../lib/tarifa-file/extend_syntax');

var extendFixtureNominal = {
  platforms: ['ios', 'android'],
  configurations_mixins: {
    green: {
      assets_path: 'images/green',
      cordova: {
        preferences: {
          StatusBarBackgroundColor: '#34AD8F'
        }
      }
    },
    blue: {
      assets_path: 'images/blue'
    }
  },
  configurations: {
    ios: {
      green_dev: {
        extend: 'green',
        should_be_kept: 'yes'
      },
      blue_dev: {
        extend: 'blue'
      },
      red_dev: {
        name: 'Red name'
      }
    },
    android: {
      green_dev: {
        extend: 'green'
      },
      blue_dev: {
        extend: 'blue'
      }
    }
  }
};

var extendFixtureFailure = {
  platforms: ['android'],
  configurations: {
    android: {
      'default': {
        extend: 'nonexistent'
      }
    }
  }
};

test('tarifa.json: extend a configuration, extend mixin from configurations_mixins', function(t) {
    t.plan(5);

    var extended = extendSyntax(extendFixtureNominal);
    var green_extended_ios = extended.configurations.ios.green_dev;
    var red_extended_ios = extended.configurations.ios.red_dev;
    var blue_extended_android = extended.configurations.android.blue_dev;
    var green_mixin = extendFixtureNominal.configurations_mixins.green;
    var blue_mixin = extendFixtureNominal.configurations_mixins.blue;

    t.equal(
        green_extended_ios.assets_path,
        green_mixin.assets_path,
        'Shallow extend for green configuration in ios'
    );

    t.equal(
        blue_extended_android.assets_path,
        blue_mixin.assets_path,
        'Shallow extend for blue configuration in android'
    );

    t.deepEqual(
        green_extended_ios.cordova,
        { 'preferences': { 'StatusBarBackgroundColor': '#34AD8F' } },
        'Deep extend'
    );

    t.equal(
        green_extended_ios.should_be_kept,
        'yes',
        'Should keep values that are not in mixin'
    );

    t.equal(
        red_extended_ios.name,
        'Red name',
        'Should keep configurations even if they don\'t extend anything'
    );
});

test('tarifa.json: extend a configuration, should throw an error when a mixin doesn\'t exist', function(t) {
    t.plan(4);
    var extended = extendSyntax(extendFixtureFailure);
    var inspected = Q(extended).inspect();

    t.equal(inspected.state, 'rejected', 'Must be rejected');
    t.notEqual(
        inspected.reason.match(/mixin "nonexistent"/),
        null,
        'Rejection message should contain mixin name'
    );
    t.notEqual(
        inspected.reason.match(/platform "android"/),
        null,
        'Rejection message should contain platform name'
    );
    t.notEqual(
        inspected.reason.match(/configuration "default"/),
        null,
        'Rejection message should contain configuration name'
    );
});

test('tarifa.json: extend a configuration, should not throw any error when called with empty object', function(t) {
    t.plan(3);
    t.deepEqual(extendSyntax({}), {});

    var confOnlyWithPlatforms = {'platforms': ['ios', 'android']};
    t.deepEqual(extendSyntax(confOnlyWithPlatforms), confOnlyWithPlatforms);

    var withEmptyConfs = {'platforms': ['ios', 'android'], 'configurations': {'a': {'b': 'c'}} };
    t.deepEqual(extendSyntax(withEmptyConfs), withEmptyConfs);
});
