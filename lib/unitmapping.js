class UnitMapping {
    constructor() {
        this.mapping = {
            "mt": "meters",
            "km": "kilometers",
            "mi": "miles",
            "kf": "kilo-ft",
            'ST': "[standard trace]",
            'RT': "[reverse trace]",
            'DT': "[difference trace]",
            'RF': "[reference]",
            'BC': "(as-built)",
            'CC': "(as-current)",
            'RC': "(as-repaired)",
            'OT': "(other)",
            //REF: http://www.ciscopress.com/articles/article.asp?p=170740&seqNum=7
            651: "G.651 (50um core multimode)",
            652: "G.652 (standard SMF)",
            653: "G.653 (dispersion-shifted fiber)",
            654: "G.654 (1550nm loss-minimzed fiber)",
            655: "G.655 (nonzero dispersion-shifted fiber)",
        }
    }

    async getMapping(key, append = false) {
        let result = "";
        if (key in this.mapping) {
            let prefix = "";
            if (append) {
                prefix = key + " ";
            }
            result = prefix + this.mapping[key];
        }
        return result;
    }
}

module.exports = UnitMapping;