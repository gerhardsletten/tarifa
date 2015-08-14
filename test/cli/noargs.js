var test = require('tape'),
    spawn = require('tape-spawn'),
    fs = require('fs'),
    path = require('path'),
    tarifa = require('../helpers').cmd;

test('tarifa without any args', function (t) {
    var st = spawn(t, tarifa('')),
        usageFilePath = path.join(__dirname, '../../bin/usage.txt'),
        helpText = fs.readFileSync(usageFilePath).toString() + '\n';

    st.succeeds('help text matched!');
    st.stdout.match(helpText);
    st.exitCode(0);
    st.end();
});
