class Keyevent {
    constructor(name) {
        this.name = name;
        this.eventMap = new Event();
        this.summaryMap = new Summaryevent();
        this.units = [{
            "name": "event number",
            "type": "uInt",
            "length": 2,
            "term": true, //termination \0
            "func": ['loopEvents', 'getSummary'],
            "numCalls": ['this', 1],
            "result": "numCalls",
            "propNames": ["events", "summary"],
            "params": [
                ['FxdParams.ior',
                    'FxdParams.sol'
                ],
                []
            ],
        }, ];
    }
    async loopEvents(arr) {
        let ior = arr[0];
        let sol = arr[1];
        let factor = 1e-4 * sol / parseFloat(ior);
        this.eventMap.factor = factor;
        this.summaryMap.factor = factor;
        return {
            'name': 'events',
            'obj': this.eventMap
        };
    }
    async getSummary() {
        return {
            'name': 'summary',
            'obj': this.summaryMap
        };
    }
}

class Summaryevent {
    constructor() {
        this.params = {};
        this.factor = 0;
        this.units = [{
                "name": "total loss",
                "type": "Int",
                "length": 4,
                "pres": 3,
                "scale": 0.001,
            },
            {
                "name": "loss start",
                "type": "Int",
                "length": 4,
                "pres": 6,
                "mult": "factor",
            },
            {
                "name": "loss end",
                "type": "uInt",
                "length": 4,
                "pres": 6,
                "mult": "factor",
            },
            {
                "name": "ORL",
                "type": "uInt",
                "length": 2,
                "scale": 0.001,
                "pres": 3,
            },
            {
                "name": "ORL start",
                "type": "Int",
                "length": 4,
                "pres": 6,
                "mult": "factor",
            },
            {
                "name": "ORL finish",
                "type": "uInt",
                "length": 4,
                "pres": 6,
                "mult": "factor",
            },
        ];
    }
}

class Event {
    constructor() {
        this.params = {};
        this.factor = 0;
        this.units = [{
                "name": "number",
                "type": "uInt",
                "length": 2,
            },
            {
                "name": "distance",
                "type": "uInt",
                "length": 4,
                "mult": "factor",
            },
            {
                "name": "slope",
                "type": "Int",
                "length": 2,
                "pres": 3,
                "scale": 0.001,
            },
            {
                "name": "splice",
                "type": "Int",
                "length": 2,
                "pres": 3,
                "scale": 0.001,
            },
            {
                "name": "refl loss",
                "type": "Int",
                "length": 4,
                "pres": 3,
                "scale": 0.001,
            },
            {
                "name": "event type",
                "type": "String",
                "length": 8,
                "func": ["eventMap"],
                "params": [
                    ['this']
                ],
                "result": "append",
            },
            {
                "name": "end of prev",
                "type": "uInt",
                "length": 4,
                "pres": 3,
                "mult": "factor",
            },
            {
                "name": "start of curr",
                "type": "uInt",
                "length": 4,
                "pres": 3,
                "mult": "factor",
            },
            {
                "name": "end of curr",
                "type": "uInt",
                "length": 4,
                "pres": 3,
                "mult": "factor",
            },
            {
                "name": "start of next",
                "type": "uInt",
                "length": 4,
                "pres": 3,
                "mult": "factor",
            },
            {
                "name": "peak",
                "type": "uInt",
                "length": 4,
                "pres": 3,
                "mult": "factor",
            },
            {
                "name": "comments",
                "type": "String",
                "length": 0,
            },
        ];
    }
    async eventMap(arr) {
        let value = arr[0];
        let pattern = "(.)(.)9999LS";
        let match = value.match(pattern);
        let res = value;
        if (match != null) {

            res += " ";
            switch (match[2]) {
                case 'A':
                    res += "manual";
                    break;
                case 'E':
                    res += "end";
                    break;
                default:
                    res += "auto";
                    break;
            }


            res += " ";
            let cInt = parseInt(match[1]);
            switch (cInt) {
                case 0:
                    res += "loss/drop/gain";
                    break;
                case 1:
                    res += "reflection";
                    break;
                case 2:
                    res += "multiple";
                    break;
                default:
                    res += "unknown";
                    break;
            }
        }
        let obj = {
            "result": res,
        }
        return obj;
    }
}

module.exports = Keyevent;