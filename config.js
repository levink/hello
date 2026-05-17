/*
    Default app configuration.
    
    Nullable properties must be set with command arguments. 
    
    Example:
    node app.js db_pass=1111 notify_pass=qwerty
*/

const config = {
    host: '127.0.0.1',
    port: '3500',
    db_user: null,
    db_name: null,
    db_pass: null, 
    notyfy_sender: null,
    notify_pass: null,
    notify_targets: null,
};

function split_item(option) {
    // Split the first '=' and capture everything after it
    const regex = /=(.*)/;
    const [first, ...rest] = option.split(regex);
    if (rest.length == 0) {
        return [first, undefined];
    }
    return [first, rest[0]]
}

export function parse (argv) {

    var errors = 0;
    if (argv.length <= 2) {
        console.log(`[Warning] expected cmd: 'node app.js host=127.0.0.1 port=3500'`);
        errors++;
    }

    for(var i = 2; i < argv.length; i++) {
        const [name, value] = split_item(argv[i]);
        
        if (value == null) {
            console.log(`[Error] value for argv parameter '${name}' is undefined. Skip this`);
            errors++;
            continue;
        }
        
        if (config[name] === undefined) {
            console.log(`[Error] config has unexpected property '${name}=${value}'. Skip this`);
            errors++;
            continue;
        }

        config[name] = value;
    }

    Object.keys(config).forEach(key => {
        if (config[key] == null) {
            console.log(`[Error] 'config.${key}' does not set.`);
            errors++;
        }
    });

    config.has_errors = function() {
        return errors != 0;
    }

    return config;
}

