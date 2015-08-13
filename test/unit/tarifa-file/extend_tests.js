var assert = require('assert'),
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

describe('extend a configuration', function() {
    it('should extend mixin from configurations_mixins', function () {
        var extended = extendSyntax(extendFixtureNominal);

        var green_extended_ios = extended.configurations.ios.green_dev;
        var red_extended_ios = extended.configurations.ios.red_dev;
        var blue_extended_android = extended.configurations.android.blue_dev;

        var green_mixin = extendFixtureNominal.configurations_mixins.green;
        var blue_mixin = extendFixtureNominal.configurations_mixins.blue;

        assert.equal(
            green_extended_ios.assets_path,
            green_mixin.assets_path,
            'Shallow extend for green configuration in ios'
        );

        assert.equal(
            blue_extended_android.assets_path,
            blue_mixin.assets_path,
            'Shallow extend for blue configuration in android'
        );

        assert.deepEqual(
            green_extended_ios.cordova,
            { 'preferences': { 'StatusBarBackgroundColor': '#34AD8F' } },
            'Deep extend'
        );

        assert.equal(
            green_extended_ios.should_be_kept,
            'yes',
            'Should keep values that are not in mixin'
        );

        assert.equal(
            red_extended_ios.name,
            'Red name',
            'Should keep configurations even if they don\'t extend anything'
        );
    });

    it('should throw an error when a mixin doesn\'t exist', function() {
        var extended = extendSyntax(extendFixtureFailure);
        var inspected = Q(extended).inspect();

        assert.equal(inspected.state, 'rejected', 'Must be rejected');
        assert.notStrictEqual(inspected.reason.match(/mixin "nonexistent"/), null, 'Rejection message should contain mixin name');
        assert.notStrictEqual(inspected.reason.match(/platform "android"/), null, 'Rejection message should contain platform name');
        assert.notStrictEqual(inspected.reason.match(/configuration "default"/), null, 'Rejection message should contain configuration name');
    });

    it('should not throw any error when called with an empty object', function() {
        assert.deepEqual(extendSyntax({}), {});

        var confOnlyWithPlatforms = {'platforms': ['ios', 'android']};
        assert.deepEqual(extendSyntax(confOnlyWithPlatforms), confOnlyWithPlatforms);

        var withEmptyConfs = {'platforms': ['ios', 'android'], 'configurations': {'a': {'b': 'c'}} };
        assert.deepEqual(extendSyntax(withEmptyConfs), withEmptyConfs);
    });

});
