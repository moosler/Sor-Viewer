class Supparam {
    constructor(name) {
        this.name = name;
        this.prefix = name.length + 1; // including \0
        this.params = {};
        this.units = [{
                "name": "supplier",
                "type": "String",
                "length": 0,
                "term": true, //termination \0
            },
            {
                "name": "OTDR",
                "type": "String",
                "length": 0,
                "term": true,
            },
            {
                "name": "OTDR S/N",
                "type": "String",
                "length": 0,
                "term": true,
            },
            {
                "name": "module",
                "type": "String",
                "length": 0,
                "term": true,
            },
            {
                "name": "module S/N",
                "type": "String",
                "length": 0,
                "term": true,
            },
            {
                "name": "software",
                "type": "String",
                "length": 0,
                "term": true,
            },
            {
                "name": "other",
                "type": "String",
                "length": 0,
                "term": true,
            },
        ];
    }
}

module.exports = Supparam;