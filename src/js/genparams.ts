export class Genparam {
    name: string | any[];
    prefix: number;
    params: {};
    units: ({ name: string; type: string; length: number; term: boolean; read?: undefined; unit?: undefined; append?: undefined; version?: undefined; } | { name: string; type: string; read: string; length: number; term: boolean; unit?: undefined; append?: undefined; version?: undefined; } | { name: string; type: string; length: number; unit: string; term: boolean; read?: undefined; append?: undefined; version?: undefined; } | { name: string; type: string; read: string; length: number; append: boolean; term: boolean; unit?: undefined; version?: undefined; } | { name: string; type: string; length: number; term: boolean; version: number; read?: undefined; unit?: undefined; append?: undefined; })[];
    constructor(name: string | any[]) {
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