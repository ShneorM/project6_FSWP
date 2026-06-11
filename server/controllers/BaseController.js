class BaseController {
    constructor(service, resourceName, ownerField = null, queryParamMapping = null) {
        this.service = service;
        this.resourceName = resourceName;
        this.ownerField = ownerField; // e.g. 'user_id'
        this.queryParamMapping = queryParamMapping; // maps req.query.userId to db user_id
        
        // Bind methods to preserve 'this' context in Express routes
        this.getAll = this.getAll.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async getAll(req, res) {
        try {
            let conditions = {};
            if (this.queryParamMapping) {
                for (const [paramKey, dbColumn] of Object.entries(this.queryParamMapping)) {
                    if (req.query[paramKey]) conditions[dbColumn] = req.query[paramKey];
                    if (req.params[paramKey]) conditions[dbColumn] = req.params[paramKey];
                }
            }
            
            const rows = await this.service.find(conditions);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            const newItem = await this.service.create(req.body);
            res.status(201).json(newItem);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Duplicate entry' });
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        const { id } = req.params;
        try {
            const data = { ...req.body };
            let ownerCondition = {};
            if (this.ownerField && data[this.ownerField]) {
                ownerCondition[this.ownerField] = data[this.ownerField];
            } else if (this.ownerField) {
                return res.status(400).json({ error: `Missing ${this.ownerField} for authorization` });
            }
            
            const success = await this.service.update(id, data, ownerCondition);
            if (!success) return res.status(404).json({ error: `${this.resourceName} not found or unauthorized` });
            
            res.json({ message: `${this.resourceName} updated successfully`, id, ...data });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        const { id } = req.params;
        try {
            let ownerCondition = {};
            if (this.ownerField && req.body[this.ownerField]) {
                ownerCondition[this.ownerField] = req.body[this.ownerField];
            } else if (this.ownerField) {
                return res.status(400).json({ error: `Missing ${this.ownerField} for authorization` });
            }

            const success = await this.service.delete(id, ownerCondition);
            if (!success) return res.status(404).json({ error: `${this.resourceName} not found or unauthorized` });
            res.json({ message: `${this.resourceName} deleted successfully` });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = BaseController;
