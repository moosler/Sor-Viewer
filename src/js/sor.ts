import { Parser } from "./parser";

/**
 * all values are encoded as little endian signed or unsigned integers, with floating - point values represented as scaled integers
 */
export class SorReader {
  path?: string;
  defaultConfig: object;
  config: any;
  data: object;
  parser: any;

  constructor(path?: string, config = {}, data = {}) {
    this.path = path;
    this.defaultConfig = {
      debug: false, //Logging Infos to Console
      createJson: false, //write result in an JsonFile
      jsonPath: ".", //if createJson is true this is the path there the json file is saved
      jsonName: "result.json", //if createJson is true this is the name of the json File
      devMode: false, //For Development: if true only the first 100 DataPoints are read
      browserMode: true, //BrowserMode
    };
    this.config = {
      ...this.defaultConfig,
      ...config,
    };
    this.data = data;
    this.parser = new Parser(this.config, this.path, this.data);
  }
  async parse() {
    try {
      let result = await this.parser.run();
      if (this.config.createJson) {
        this.writeFileToLocalStorage(result);
      } else {
        return result;
      }
    } catch (err) {
      console.log(`There was an parsing error: ${err}`);
    }
  }
  writeFileToLocalStorage(result: any) {
    // let filename = this.config.jsonPath + "/" + this.config.jsonName;
    let data = JSON.stringify(result);
    window.localStorage.setItem("arr", data);
    // console.log(JSON.parse(window.localStorage.getItem("arr")));
  }
}
