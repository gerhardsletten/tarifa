tarifa [![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/hughsk/stability-badges) [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/TarifaTools/tarifa)
======

<a href="http://tarifa.tools">
    <img src="./template/assets/logo.png" width="100px" align="center" alt="tarifa logo" />
</a>

*Your friendly toolchain for mobile app development on top of Apache Cordova*

tarifa is a CLI on top of [Apache Cordova](http://cordova.apache.org/).
It aims at simplifying the Apache Cordova workflow and adding features to complete cordova toolchain such as:

* **multiple configurations**: produce multiple unique apps easily on a given platform within a single project.
* **integration of any front-end build system**: integrate your build process in the cordova workflow.
* **interactive project bootstrap**: no need to remember every required information while creating a project, tarifa will guide you
with adequate questions and save the answers in the project files.
* **deployment to hockeyapp from the terminal**: no need to launch a browser to upload a binary file to hockeyapp, tarifa handles it.

### Requirements

| sdk/os                                     | macosx | linux | win32 |
| -------------------------------------------|:------:|:-----:|:-----:|
| [ios](http://developer.apple.com/)         | ✔      | ✗     | ✗     |
| [android](http://developer.android.com/)   | ✔      | ✔     | ✔     |
| [windows phone](http://msdn.microsoft.com/en-us/library/windows/apps/ff630878) | ✗      | ✗     | ✔     |
| firefoxos (experimental) |  ✔      | ✗     | ✗     |

* [ImageMagick](http://www.imagemagick.org/)
* [nomad cli: cupertino](https://github.com/nomad/cupertino) (only ios)
* [ios-webkit-debug-proxy](https://github.com/google/ios-webkit-debug-proxy)  (only ios)
* [libimobiledevice](http://www.libimobiledevice.org/)  (only ios)
* [ideviceinstaller](http://www.libimobiledevice.org/)  (only ios)

### Documentation

Documentation can be read on [doc.tarifa.tools](http://doc.tarifa.tools) ([pdf](https://www.gitbook.com/download/pdf/book/42loops/tarifa), [epub](https://www.gitbook.com/download/epub/book/42loops/tarifa), [mobi](https://www.gitbook.com/download/mobi/book/42loops/tarifa)).

### Install

```
npm install tarifa -g
```

Some optional dependencies could fail depending on your os
(such as cordova-deploy-windows-phone fails to install on linux or macosx).

### Usage

```
Usage: tarifa [command] [options]

Commands:

    create         Create a tarifa project (or a cordova plugin)
    prepare        Prepare the www project with a given platform and configuration
    platform       Manage current project platforms
    plugin         Add, remove or list cordova plugins in your project
    build          Build the project for a given platform and configuration
    run            Run the project for a given platform and configuration on your device
    info           Get some information about your environment
    device         Get informations about your connected devices
    config         Configure the current project
    check          Check the current project after cloning
    clean          Clean the given platform
    hockeyapp      Interface with hockeyapp beta testing platform
    update         Update current project cordova platforms and core plugins
    watch          Watch current project
    test           Test current project on your device with appium

Options:

    --version, -v  Show tarifa version number
    --verbose, -V  Add verbosity to commands
    --help, -h     Show this message

Global options:

    --debug, -d    Print helpful stack trace on error
```

### Install for developement

```
git clone https://github.com/TarifaTools/tarifa.git && cd tarifa && npm link .
```

### Tests

running tests without devices:

```
npm test
```

The output of `npm test` can be found on our buildbot [ci.tarifa.tools](http://ci.tarifa.tools/)

test with devices:

```
npm run test-run
```

signing tests:

```
npm run test-sign
```

For signing tests you need to provide the following json file:

- `test/fixtures/private.ios.json`

Both providing needed signing informations.
Examples can be found in the `test/fixtures/` folder.

## License

tarifa is licensed under Apache version 2.0

## Sponsors

* [zengularity](http://zengularity.com)

[![Analytics](https://ga-beacon.appspot.com/UA-35740178-1/tarifa/readme?pixel)](https://github.com/igrigorik/ga-beacon)
