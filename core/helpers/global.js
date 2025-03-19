const fs = require('fs'); // Import the 'fs' module

// Global variables
let core_path = __dirname.replace('core\\helpers', ''); // Windows
core_path = core_path.replace('/core/helpers', ''); // Linux
global.root_directory = core_path;

// Global functions
global.__resolved_classes = [];

global.view = function(response) {
    if (response === undefined) response = null;
    return resolve('core.render.view', response);
};

global.resolve = function(file, ...deps) {
    file = file.replace(/\./g,'/');
    var instance = require(root_directory + '/' + file + '.js');
    if (deps !== undefined && deps.length > 0) {
        return new instance(...deps);
    }
    return new instance();
};

global.resolveOnce = function(file, ...deps) {
    let resolved_instance = null;
    file = file.replace(/\./g,'/');
    var instance = require(root_directory + '/' + file + '.js');

    for (let i in __resolved_classes) {
        if (i == file) {
            resolved_instance = __resolved_classes[i];
        }
    }

    if (resolved_instance === null) {
        if (deps !== undefined && deps.length > 0) {
            resolved_instance = new instance(...deps);
        } else {
            resolved_instance = new instance();
        }
        __resolved_classes[file] = resolved_instance;
        return resolved_instance;
    }
    return resolved_instance;
};

global.readJson = function(file) {
    file = file.replace(/\./g,'/');
    var json = JSON.parse(fs.readFileSync(root_directory + '/' + file + '.json', 'utf8'));
    return json;
};

global.use = function(file) {
    file = file.replace(/\./g,'/');
    return require(root_directory + '/' + file + '.js');
};

global.getEnv = function(name, default_value) {
    if (default_value === undefined) {
        default_value = '';
    }
    return process.env[name] !== undefined ? process.env[name] : default_value;
};

global.replaceAll = function(str, find, replace) {
    find = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return str.replace(new RegExp(find, 'g'), replace);
};