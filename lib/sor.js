const Parser = require('./parser');
var fs = require('fs');

/**
 * all values are encoded as little endian signed or unsigned integers, with floating - point values represented as scaled integers
 */
class SorReader {
    constructor(path, config = {}, data = {}) {
        this.path = path;
        this.defaultConfig = {
            debug: false, //Logging Infos to Console
            createJson: false, //write result in an JsonFile
            jsonPath: '.', //if createJson is true this is the path there the json file is saved
            jsonName: 'result.json', //if createJson is true this is the name of the json File
            devMode: false, //For Development: if true only the first 100 DataPoints are read
            browserMode: false //BrowserMode
        }
        this.config = {
            ...this.defaultConfig,
            ...config
        }
        this.data = data;
        this.parser = new Parser(this.path, this.config, this.data);
    }
    async parse() {
        try {
            let result = await this.parser.run();
            if (this.config.createJson) {
                let filename = this.config.jsonPath + '/' + this.config.jsonName;
                let data = JSON.stringify(result);
                fs.writeFileSync(filename, data);
            } else {
                return (result);
            }
        } catch (err) {
            console.log(`There was an parsing error: ${err}`);
        }
    }
}
//For Browser Version
if (typeof window != "undefined") {
    window.SorReader = SorReader
}
//For Node Version
module.exports = SorReader;