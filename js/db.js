import mysql from 'mysql2';

var pool = null;

export async function open(config) {
    pool = mysql.createPool({
        host: 'localhost',
        user: config.user,
        password: config.password,
        database: config.database,
        namedPlaceholders: true,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    }).promise();

    const conn = await pool.getConnection();
    conn.release();
    console.log('Database connected');
}

export async function close() {
    await pool.end();
}

const util = {
    trim: function(str, maxLength) {
        var trimmed = str.trim();
        if (trimmed)
            return trimmed.substring(0, maxLength);
        return null;
    }
};

export function toRow(body, ip) {
    const row = {
        id: null, 
        name: util.trim(body.name, 80), 
        phone: util.trim(body.phone, 20), 
        email: util.trim(body.email, 255), 
        message: util.trim(body.message, 1000), 
        ip: util.trim(ip, 16)
    };

    return row;
}

export async function insertRequest(row) {
    const sql = `INSERT INTO 
        request (name, phone, email, message, ipv4)
        VALUES (:name, :phone, :email, :message, :ip);`;
    const [result] = await pool.query(sql, row);
    return result.insertId;
}
