var test = require('tape'),
    spawn = require('tape-spawn'),
    path = require('path'),
    fs = require('fs'),
    h = require('../helpers');

test('tarifa prepare -h', function (t) {
    var st = spawn(t, h.cmd('prepare -h')),
        usageFilePath = path.join(__dirname, '../../actions/prepare/usage.txt'),
        helpText = fs.readFileSync(usageFilePath).toString() + '\n';

    st.stdout.match(helpText, 'help text matched');
    st.exitCode(0);
    st.end();
});
