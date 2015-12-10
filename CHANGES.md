## 0.13.1 (12/10/2015)

### changes

- republish on npm with fixed `.npmignore`

## 0.13.0 (11/24/2015)

### supported cordova platforms:

- android: 4.1.1
- ios: 3.9.0, 3.9.2 (default)
- wp8: 3.8.1
- browser: 4.0.0
- firefoxos: 3.6.3

### changes

- nodejs 5.x and npm 3.x support [#284](https://github.com/TarifaTools/tarifa/issues/284) and [#277](https://github.com/TarifaTools/tarifa/issues/277)
- add --nolivereload option on tarifa watch [#273](https://github.com/TarifaTools/tarifa/issues/273)
- extend multiple configurations in `tarifa.json` [#270](https://github.com/TarifaTools/tarifa/issues/270)
- [iOS] replace alpha channel on iOS generated icons with a given color for `tarifa config icons file` [#269](https://github.com/TarifaTools/tarifa/issues/269)
- add push notifications cordova plugin phonegap-plugin-push@1.4.2 [#258](https://github.com/TarifaTools/tarifa/issues/258)
- if available copy extra defined icons and sounds used for the push notification plugin
- [iOS] add iOS build variables support (`build.xcconfig`) on `tarifa.json` [#281](https://github.com/TarifaTools/tarifa/issues/281)
- upgrade cordova-lib to 5.4.0
- [iOS] support spaces in team [#279](https://github.com/TarifaTools/tarifa/pull/279)

## 0.12.2 (11/03/2015)

### changes

- make sure requirements checks are made with current cordova platforms

## 0.12.1 (10/07/2015)

### changes

- fix wrong plugin format in `tarifa.json` [#265](https://github.com/TarifaTools/tarifa/issues/265)
- upgrade ios-deploy to 1.8.0 [#267](https://github.com/TarifaTools/tarifa/issues/267)

## 0.12.0 (10/06/2015)

### changes

- warn if cupertino is missing on macosx [#249](https://github.com/TarifaTools/tarifa/issues/249)
- upgrade defaults cordova plugins to latest versions [#237](https://github.com/TarifaTools/tarifa/issues/237)
- refactor tests with tape [#226](https://github.com/TarifaTools/tarifa/issues/226)
- upgrade platforms: adding cordova-ios@3.9.0 [#253](https://github.com/TarifaTools/tarifa/issues/253), cordova-browser@4.0.0 [#255](https://github.com/TarifaTools/tarifa/issues/255) and cordova-android@4.1.1 [#252](https://github.com/TarifaTools/tarifa/issues/252)
- upgrade cordova-lib@5.3.3 [#262](https://github.com/TarifaTools/tarifa/issues/262)
- support nodejs v4 [#263](https://github.com/TarifaTools/tarifa/issues/263)
- remove vorlon.js

## 0.11.6 (08/11/2015)

### changes

- skip requirements checks when offline, fix [#251](https://github.com/TarifaTools/tarifa/issues/251)

## 0.11.5 (07/20/2015)

### changes

- fix output of `tarifa devices --verbose` and get properly cpu architecture
for android devices via `adb shell getprop ro.product.cpu.abi`
- fix `tarifa run android` with the `arch` option

## 0.11.4 (07/18/2015)

### changes

- add `tarifa plugin install` aliasing `tarifa plugin add`
- fix `tarifa devices` for android devices

## 0.11.3 (07/13/2015)

### changes

- [android] first package component has no min length [#246](https://github.com/TarifaTools/tarifa/issues/246)
- restrict product file name (composed of letters, digits, ., _ or -)

## 0.11.2 (07/09/2015)

### changes

- fix android check command in `tarifa check` [#243](https://github.com/TarifaTools/tarifa/issues/243)
- fix `tarifa run android` --nobuild option

## 0.11.1 (07/08/2015)

### changes

- fix `tarifa run ios` (was not able to exit ios-deploy, fix wrong ios-deploy options)

## 0.11.0 (07/07/2015)

### changes

- [android] integrate crosswalk webview plugin [#236](https://github.com/TarifaTools/tarifa/issues/236)
- [android] add device cpu infos on `tarifa device` [#235](https://github.com/TarifaTools/tarifa/issues/235)
- refactoring logs with EventEmitter [#224](https://github.com/TarifaTools/tarifa/issues/224)
- update dependencies and default project dependencies
- add global option --debug for more helpful stack trace [#239](https://github.com/TarifaTools/tarifa/issues/239)
- fix overwrite whitelist [#240](https://github.com/TarifaTools/tarifa/issues/240)

## 0.10.0 (06/16/2015)

### supported cordova platforms:

- android: 3.6.4, 3.7.1, 3.7.2, 4.0.2 (default)
- ios: 3.7.0, 3.8.0 (default)
- wp8: 3.7.0, 3.7.1 (default)
- browser: 3.6.0
- firefoxos: 3.6.3

### changes

- integrate vorlonjs for `tarifa run` [#227](https://github.com/TarifaTools/tarifa/issues/227)
- works on iojs [#220](https://github.com/TarifaTools/tarifa/issues/220)
- switch to npm as default plugin source [#219](https://github.com/TarifaTools/tarifa/issues/219)
- extend and overwrite specific ios, android and wp8 properties [#214](https://github.com/TarifaTools/tarifa/issues/214) [#230](https://github.com/TarifaTools/tarifa/issues/230)
- remove unneeded undo `tarifa build` tasks [#209](https://github.com/TarifaTools/tarifa/issues/209)
- upgrade cordova-lib to 5.1.1 [#207](https://github.com/TarifaTools/tarifa/issues/207) and [#229](https://github.com/TarifaTools/tarifa/issues/229)
- upgrade cordova-android to 4.0.2 [#204](https://github.com/TarifaTools/tarifa/issues/204) and [#222](https://github.com/TarifaTools/tarifa/issues/222)
- now, we can launch ios app with ios-deploy@1.7.0
- display `tarifa.json` and `private.json` parsing errors [#233](https://github.com/TarifaTools/tarifa/issues/233)
- fix setting ios build number [#231](https://github.com/TarifaTools/tarifa/issues/231)
- fix setting wp8 version [#232](https://github.com/TarifaTools/tarifa/issues/232)

## 0.9.7 (05/28/2015)

### changes

- [android] add cordova-android@3.7.2 fixing [CVE-2015-1835](http://blog.trendmicro.com/trendlabs-security-intelligence/trend-micro-discovers-apache-vulnerability-that-allows-one-click-modification-of-android-apps/)
see http://cordova.apache.org/announcements/2015/05/26/android-402.html

## 0.9.6 (05/15/2015)

### changes

- [browser] re-enable watch on browser platform.

## 0.9.5 (05/13/2015)

### changes

- [wp8] fix multiples configurations builds: add missing xap copy task.

## 0.9.4 (05/12/2015)

### changes

- [wp8] fix `XapSignTool` path.

## 0.9.3 (05/12/2015)

### changes

- [wp8] add `certificate_password` signing attributes in `private.json` to allow
xap signing without prompting for passwords.

## 0.9.2 (05/11/2015)

### changes

- [android] add `keystore_password` and `alias_password` signing attributes in `private.json` to allow
apk signing without prompting for passwords.

## 0.9.1 (05/08/2015)

### changes

- [ios] fix regression on build tasks order from 0.9.0

## 0.9.0 (05/02/2015)

### changes

- add `tarifa test` wrapping appium for android and ios [#202](https://github.com/TarifaTools/tarifa/issues/202)
- add `tarifa device` to output informations from connected devices [#195](https://github.com/TarifaTools/tarifa/issues/195)
- remove devices output from `tarifa info` [#195](https://github.com/TarifaTools/tarifa/issues/195)
- change ios build number via `tarifa.json` [#197](https://github.com/TarifaTools/tarifa/issues/197)
- be able to overwrite android:minSdkVersion via `tarifa.json` [#206](https://github.com/TarifaTools/tarifa/issues/206)
- watching `tarifa.json` in tarifa watch [#203](https://github.com/TarifaTools/tarifa/issues/203)
- create plugins relying on install time variables [#199](https://github.com/TarifaTools/tarifa/issues/199)
- refactor lib/devices api with the use of node-ios-device (v0.3.2) [#208](https://github.com/TarifaTools/tarifa/issues/208); node-ios-device does not work for iojs, which impacts `tarifa test` on ios: not able find names of connected devices.

## 0.8.0 (04/07/2015)

### changes

- update dependencies
- update `tarifa.json` platforms versions if needed when updating projet
- print unmet requirements when `tarifa info` fails
- add `--nobuild` option on `tarifa run` to skip build if already available
- add `--debug` option on `tarifa run` to output app debug logs
- add `tarifa plugin add --variable` which allows to use cordova plugin with
variables. tarifa keeps them in the `tarifa.json` file so, that `tarifa check --force`
still works
- add `--all` option in `tarifa run` to run to all devices without prompting
- add platform `firefoxos` (experimental, support only on darwin, no watch)
- upgrade ios-deploy to 1.5.0

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
