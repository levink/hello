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
    
    var config = {
        host: '127.0.0.1',
        port: '3500',
        db_user: null,
        db_pass: null, 
        db_name: 'profi_db'
    };

    var errors = 0;
    if (argv.length <= 2) {
        console.log(`[Warning] expected cmd: 'node app.js host=127.0.0.1 port=3500'`);
        errors++;
    }

    for(var i = 2; i < argv.length; i++) {
        const [name, value] = split_item(argv[i]);
        
        if (value == null) {
            console.log(`[Warning] value for '${name}' is undefined. Skip this`);
            errors++;
            continue;
        }
        
        if (config[name] === undefined) {
            console.log(`[Warning] unexpected property '${name}=${value}'. Skip this`);
            errors++;
            continue;
        }

        config[name] = value;
    }

    config.has_errors = function() {
        return errors != 0;
    }

    return config;
}

