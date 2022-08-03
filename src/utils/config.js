const path = require('path');
const fs = require('fs');

var location = null;
var config = {};

module.exports = (file) => {
    if (file == null) file = 'config.json';
    if (location == null) location = path.join(__dirname, '../../', file);
}

module.exports.load = () => {
    try {
        fs.accessSync(location, fs.constants.F_OK);
    } catch (e) {
        fs.writeFileSync(location, '{}');
    }

    const data = fs.readFileSync(location);
    config = JSON.parse(data);
}

module.exports.save = () => {
    return new Promise((resolve, reject) => {
        try {
            const data = JSON.stringify(config);
            fs.writeFileSync(location, data);
            resolve();
        } catch (e) {
            reject(e);
        }
    });
}

module.exports.clear = () => {
    Object.keys(config).forEach(key => {
        delete config[key];
    });
}

module.exports.setValue = (key, value) => {
    keys = key.split('.');

    keys = keys.map((key, index, array) => {
        jArray = config
        array.slice(0, index+1).forEach((_key, _index) => {
            if (jArray[_key] == null) jArray[_key] = {}
            if ((_index + 1) == array.length) jArray[_key] = value;

            jArray = jArray[_key]
        });
            
        return [array.slice(0, index+1).join('.'), jArray]
    });
}

module.exports.getValue = (key) => {
    keys = key.split('.');

    jArray = JSON.stringify(config);
    jArray = JSON.parse(jArray);

    keys.forEach(key => {
        if (jArray == null || jArray[key] == null) return jArray = null;
        jArray = jArray[key];
    });

    return jArray;
}

module.exports.getConfig = () => {
    return config;
}