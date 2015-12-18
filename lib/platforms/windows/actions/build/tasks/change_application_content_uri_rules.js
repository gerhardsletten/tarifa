var Q = require('q'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    format = require('util').format,
    pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log');

module.exports = function (msg) {
    if(!msg.watch) return msg;
    var tmpl = format(
            '<uap:ApplicationContentUriRules>%s</uap:ApplicationContentUriRules>',
            '<uap:Rule Match="ms-appx-web:///" Type="include" WindowsRuntimeAccess="all" />\n%s'
        ),
        winPath = path.join(pathHelper.platforms(), 'windows'),
        manifest = path.resolve(winPath, 'package.windows10.appxmanifest'),
        content = fs.readFileSync(manifest, 'utf-8'),
        reg = /<uap:ApplicationContentUriRules>(.|\n|\r)*<\/uap:ApplicationContentUriRules>/,
        parsedUri = url.parse(msg.watch),
        baseUri = parsedUri.href.replace(parsedUri.path, ''),
        rule = format('<uap:Rule Match="%s" Type="include" WindowsRuntimeAccess="all" />', baseUri),
        out = format(tmpl, rule);

    fs.writeFileSync(manifest, content.replace(reg, out));
    console.log(fs.readFileSync(manifest, 'utf-8'));
    log.send('success', 'add new ApplicationContentUriRules for `tarifa watch`');
    return msg;
};
