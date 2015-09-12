var test = require('tape'),
    spawn = require('tape-spawn'),
    fs = require('fs'),
    path = require('path'),
    h = require('../helpers');

test('cli: tarifa config -h', function (t) {
    var st = spawn(t, h.cmd('config -h')),
        usageFilePath = path.join(__dirname, '../../actions/config/usage.txt'),
        iosFilePath = path.join(__dirname, '../../lib/platforms/ios/actions/config/usage.txt'),
        helpText = fs.readFileSync(usageFilePath).toString() + fs.readFileSync(iosFilePath).toString() + '\n';

    st.stdout.match(helpText, 'help text matched');
    st.succeeds();
    st.end();
});
