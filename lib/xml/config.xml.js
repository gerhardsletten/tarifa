var fs = require('fs'),
    Q = require('q'),
    format = require('util').format,
    xml2js = require('xml2js');

function parse(file) {
    var xml = fs.readFileSync(file, 'utf-8'),
        defer = Q.defer();

    xml2js.parseString(xml, function (err, result) {
        if(err) return defer.reject(err);
        defer.resolve(result);
    });
    return defer.promise;
}

function get(filePath) {
    return parse(filePath).then(function (xml) {
        var preferences = {},
            access = [];

        xml.widget.preference.forEach(function (pref) {
            preferences[pref.$.name] = pref.$.value;
        });

        xml.widget.access.forEach(function (acc) {
            if (typeof acc.$['launch-external'] === 'undefined') {
                access = access.concat(acc.$.origin.split(','));
            } else {
                access.push({
                    'origin': acc.$.origin,
                    external: acc.$['launch-external'] == 'yes'
                });
            }
        });

        return {
            id: xml.widget.$.id,
            version: xml.widget.$.version,
            author_name: xml.widget.author[0]._,
            author_email: xml.widget.author[0].$.email,
            author_href: xml.widget.author[0].$.href,
            description: xml.widget.description[0],
            preference: preferences,
            access: access,
            content: xml.widget.content[0].$.src
        };
    });
}

function set(file, id, version, author_name, author_email, author_href, description, preference, access, content) {
    return parse(file).then(function (xml) {
        xml.widget.$.id = id;
        if(version) xml.widget.$.version = version;
        if(author_name) xml.widget.author[0]._ = author_name;
        if(author_email) xml.widget.author[0].$.email = author_email;
        if(author_href) xml.widget.author[0].$.href = author_href;
        if(description) xml.widget.description[0] = description;
        if(content) xml.widget.content[0].$.src = content;

        if(access) {
            var accessOrigins = [];
            xml.widget.access = [];

            for(var p in access) {
                if (typeof access[p] == 'string') {
                    accessOrigins.push(access[p])
                } else {
                    xml.widget.access.push({
                        $: {
                            origin: access[p].origin,
                            'launch-external': (access[p].external ? 'yes' : 'no')
                        }
                    });
                }
            }

            xml.widget.access.push({
                $: {
                    origin: accessOrigins.join(',')
                }
            });
        }

        if(preference) {
            xml.widget.preference = [];
            for(var pref in preference) {
                xml.widget.preference.push({
                    $: {
                        name: pref,
                        value: preference[pref]
                    }
                });
            }
        }
        return xml;
    }).then(build(file));
}

function removePlugins(filePath, plugins) {
    return parse(filePath).then(function (xml) {
        xml.widget.plugin = xml.widget.plugin.filter(function (plugin) {
            return plugins.indexOf(plugin.$.name) < 0;
        });
        return xml;
    }).then(build(filePath));
}

function build(file) {
    return function (xml) {
        var builder = new xml2js.Builder({
            renderOpts: { pretty: true, indent: '    ', newline: '\n' },
            xmldec : { "version": "1.0", "encoding": "UTF-8" },
            headless: false
        });
        var xmlString = builder.buildObject(xml);
        fs.writeFileSync(file, xmlString, 'utf-8');
    };
}

module.exports.set = set;
module.exports.get = get;
module.exports.removePlugins = removePlugins;
