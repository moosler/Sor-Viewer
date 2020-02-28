class Genparam {
    constructor(name) {
        this.name = name;
        this.prefix = name.length + 1; // including \0
        this.params = {};
        this.units = [{
                "name": "lang",
                "type": "String",
                "length": 2,
                "term": true, //termination \0
            },
            {
                "name": "cable ID",
                "type": "String",
                "length": 0,
                "term": true,
            },
            {
                "name": "fiber ID",
                "type": "String",
                "length": 0,
                "term": true,
            },
            {
                "name": "fiber type",
                "type": "Char",
                "read": "uInt",
                "length": 2,
                "term": true,
            },
            {
                "name": "wavelength",
                "type": "uInt",
                "length": 2,
                "unit": "nm",
                "term": true,
            },
            {
                "name": "location A",
                "type": "String",
                "length": 0,
                "term": true,
            },
            {
                "name": "location B",
                "type": "String",
                "length": 0,
                "term": true,
            },
            {
                "name": "cable|fiber type",
                "type": "String",
                "length": 0,
                "term": true,
            },
            {
                "name": "build condition",
                "type": "Char",
                "read": "String",
                "length": 2,
                "append": false,
                "term": false,
            },
            {
                "name": "user offset",
                "type": "Int",
                "length": 4,
                "term": true,
            },
            {
                "name": "user offset distance",
                "type": "Int",
                "length": 4,
                "term": true,
                "version": 2,
            },
            {
                "name": "operator",
                "type": "String",
                "length": 0,
                "term": true,
            },
            {
                "name": "comments",
                "type": "String",
                "length": 0,
                "term": true,
            },
        ];
    }
}

module.exports = Genparam;