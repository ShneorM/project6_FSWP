const pool = require('../config/db');

class DBService {
    constructor(tableName) {
        this.tableName = tableName;
    }

    async find(conditions = {}) {
        const keys = Object.keys(conditions);
        if (keys.length === 0) {
            const [rows] = await pool.query(`SELECT * FROM ${this.tableName} ORDER BY id ASC`);
            return rows;
        }
        const whereClause = keys.map(k => `${k} = ?`).join(' AND ');
        const values = keys.map(k => conditions[k]);
        const [rows] = await pool.query(`SELECT * FROM ${this.tableName} WHERE ${whereClause} ORDER BY id ASC`, values);
        return rows;
    }

    async create(data) {
        const keys = Object.keys(data);
        const values = keys.map(k => data[k]);
        const placeholders = keys.map(() => '?').join(', ');
        const [result] = await pool.query(`INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`, values);
        return { id: result.insertId, ...data };
    }

    async update(id, data, ownerCondition = {}) {
        const keys = Object.keys(data);
        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = keys.map(k => data[k]);

        const ownerKeys = Object.keys(ownerCondition);
        let whereClause = `id = ?`;
        let whereValues = [id];

        if (ownerKeys.length > 0) {
            whereClause += ' AND ' + ownerKeys.map(k => `${k} = ?`).join(' AND ');
            whereValues.push(...ownerKeys.map(k => ownerCondition[k]));
        }

        const [result] = await pool.query(`UPDATE ${this.tableName} SET ${setClause} WHERE ${whereClause}`, [...values, ...whereValues]);
        return result.affectedRows > 0;
    }

    async delete(id, ownerCondition = {}) {
        const ownerKeys = Object.keys(ownerCondition);
        let whereClause = `id = ?`;
        let whereValues = [id];

        if (ownerKeys.length > 0) {
            whereClause += ' AND ' + ownerKeys.map(k => `${k} = ?`).join(' AND ');
            whereValues.push(...ownerKeys.map(k => ownerCondition[k]));
        }

        const [result] = await pool.query(`DELETE FROM ${this.tableName} WHERE ${whereClause}`, whereValues);
        return result.affectedRows > 0;
    }
}

module.exports = DBService;
