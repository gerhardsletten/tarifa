## 0.7.2 (03/14/2015)

### changes

- fix building multiple configurations on wp8

## 0.7.1 (03/12/2015)

### changes

- remove `.gitignore` file in default template which add missing default template index.html

## 0.7.0 (03/09/2015)

### supported cordova platforms:

- android: 3.6.4, 3.7.1
- ios: 3.7.0, 3.8.0
- wp8: 3.7.0, 3.7.1
- browser: 3.6.0

### changes

- upgrade cordova-ios to version 3.8.0 and cordova-wp8 to version 3.7.1

## 0.6.1 (02/26/2015)

### changes

- Fix configuration objects rewrite over mixins in `tarifa.json` file

## 0.6.0 (02/23/2015)

### supported cordova platforms:

- android: 3.6.4, 3.7.1
- ios: 3.7.0
- wp8: 3.7.0
- browser: 3.6.0

### upgrade a project from 0.5.x to 0.6.0

Run `tarifa update` to update platforms and default plugins.
Extend each platforms defined in the `platforms` root attribute of `tarifa.json`
with the according version for example `android` becomes `android@3.7.1`.

### changes

- refactoring all specific platforms code in `lib/platforms/$platform`
- adding version on defined platforms in `tarifa.json` like `android@3.7.1`
- [android] re add versionCode overwritting if available in configuration in `pre-cordova-compile` tasks
- adding `extend` keyword in configuration definition to extend configuration objects
- add `--dump-configuration` option to `tarifa info` to dump configuration after parsing
- upgade default plugins to latest cordova plugins release: http://cordova.apache.org/news/2015/02/10/plugins-release.html
- upgrade cordova-lib to 4.2.0
- regenerate cordova app with `tarifa check` if `app` folder is not found
- change `tarifa update`: now if new platforms are available, tarifa removes them and re install new ones
- no more `.gitignore` files while creating new project

## 0.5.1 (01/21/2015)

- fix `tarifa plugin add` when used with plugins having dependencies
- fix lib/cordova/version when using project path with white spaces
- fix inquirer usage in lib/questions/ to support 0.8.1

## 0.5.0 (01/14/2015)

### upgrade a project from 0.4.0 to 0.5.0

You need to upgrade the `tarifa.json` and `private.json` files and move all signing
attributes to the new `signing` root attribute, see
[signing documentation](http://42loops.gitbooks.io/tarifa/content/configurations/index.html#signing)
for more help.

### changes

- allow `all` keyword and configuration enumeration like `stage,prod` as command line arguments to build
or run any combination of the tuple (configuration, platform) [#103](https://github.com/TarifaTools/tarifa/issues/103)
- group all signing properties under the `signing` attribute [#115](https://github.com/TarifaTools/tarifa/issues/115)
- add `tarifa create plugin`: create a cordova plugin skeleton [#139](https://github.com/TarifaTools/tarifa/issues/139)
- handling of `access origin` `launch-external` attribute [#158](https://github.com/TarifaTools/tarifa/issues/158)
- [ios] copy `build.xcconfig` on platform add ios [#153](https://github.com/TarifaTools/tarifa/issues/153)
- [ios] add `tarifa config provisioning info <configuration>`: extract data from a provisioning file [#148](https://github.com/TarifaTools/tarifa/issues/148)
- [ios] add `tarifa config provisioning fetch`: fetch and install a provisioning file [#148](https://github.com/TarifaTools/tarifa/issues/148)
- [ios] handle ios store distribution signing process [#135](https://github.com/TarifaTools/tarifa/issues/135)
- [ios] check if all the defined provisioning files exist on `tarifa check` [#147](https://github.com/TarifaTools/tarifa/issues/147)
- [android] add `--clean-resources` option on `tarifa build` and `tarifa run`: clean android assets (`res` folder and generated apks) [#162](https://github.com/TarifaTools/tarifa/issues/162)

## 0.4.0 (12/18/2014)

### upgrade a project from 0.3.x to 0.4.0

run `tarifa update --verbose` command.

### changes

- `tarifa watch`: live reload for all platforms (inspired from https://github.com/driftyco/ionic-cli)
- [wp8 company app distribution] replace `sign_mode` in `tarifa.json` with `certificate_path`
- now, we have a buildbot!: http://ci.tarifa.tools watching all repo branches
- test android, ios(ad-hoc) and wp8 signing process
- upgrade to cordova 4.1.2 (which upgrade cordova-ios@3.7.0 and cordova-wp8@3.7.0)
- updade default plugins to latest cordova plugins release: http://cordova.apache.org/news/2014/12/09/plugins-release.html
- `~` style path are now correctly handled in `tarifa create`
- allow parentheses in product name
- create a tarifa project in the current directory
- support `commit_sha`, `build_server_url` and `repository_url` options in `tarifa hockeyapp`
- do not impose what is private in tarifa.json/private.json files only on `tarifa create`
- create an `hockeyapp_id` when upload new configuration
- `tarifa create` creates android keystore if wanted

## 0.3.1 10/28/2014

- something went wrong while publishing 0.3.0 on npm: republish on npm.

## 0.3.0 10/28/2014

### upgrade a project from 0.2.5 to 0.3.0

- remove the `web` platform and the according configuration in the tarifa.json
- execute the command `tarifa update --verbose` to update cordova plugins and platforms
- execute the command `tarifa platform add browser --verbose` to add the browser platform
- in the tarifa.json file, rename the `check.web` key to `check.browser` and ensure the
corresponding value is a valid `'./project/bin/check_browser.js'` script

### changes

- update cordova-lib to 4.0.0
- replace the `web` platform with the new `browser` platform
- `tarifa info` adding current project cordova-$platform versions
- adding tests: `npm test` and `npm run all`
- www project output can be changed in any configuration with
the `project_output` attribute
- warn user if name given in tarifa file does not match the cordova project's name
- icons and splashscreens folder `images` can be overwritten with the `assets_path`
attribute in the tarifa.json file
- the cordova attribute in tarifa.json can be overwritten in any configuration
- new command `tarifa update` for updating default plugins and cordova platforms
- call tarifa in any project subdirectory
- adding a wp8 gitignore
- cleaning gradle build cache on `tarifa clean`
- update .gitignore for gradle builds
- ability to overwrite chrome path on linux and windows in user configstore yaml file
- be able to choose `all` devices on `tarifa run`
- speed up the cli by not requiring all actions on start
- support 9patch splashscreens on android
- `tarifa platform` supports following format for add action: `$platform@version`

## 0.2.5 10/09/2014

- remove postinstall scripts

## 0.2.4 10/08/2014

- fix default template project for web platform.
- fix `tarifa create` when choosing any platform.

## 0.2.3 10/08/2014

- [android] remove versionCode handling, since 3.5.0, cordova generates it from the version.

## 0.2.2 10/07/2014

- remove check for `ant` in `tarifa info`

## 0.2.1 10/06/2014

- fix tarifa plugin add/remove of plugins with dependencies.

## 0.2.0 10/06/2014

- initial release.
