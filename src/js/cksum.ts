export class Cksum {
    name: string;
    prefix:number;
    params:object;
    units: object[];
    constructor(name:string) {
        this.name = name;
        this.prefix = name.length + 1; // including \0
        this.params = {};

        this.units = [{
            "name": "checksum",
            "type": "uInt",
            "length": 2,
            "term": true, //termination \0
        }, ];
    }
}
