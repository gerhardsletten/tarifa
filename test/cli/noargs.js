var test = require('tape'),
    spawn = require('tape-spawn'),
    fs = require('fs'),
    path = require('path'),
    tarifa = require('../helpers').cmd;

test('cli: tarifa', function (t) {
    var st = spawn(t, tarifa('')),
        usageFilePath = path.join(__dirname, '../../bin/usage.txt'),
        helpText = fs.readFileSync(usageFilePath).toString() + '\n';

    st.stdout.match(helpText, 'help text matched');
    st.succeeds();
    st.end();
});
