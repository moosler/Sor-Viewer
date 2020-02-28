const SorReader = require("./lib/sor.js");

let arg = process.argv;
let dir = "./";
let datapath = dir + "data";
let sample1 = "EXFO_FTB7400_1550_U.SOR";
let sample2 = "JDSU_MTS6000_1310_G.sor";
let sample3 = "sample1310_lowDR.sor";

let filename = sample3;

let filepath = datapath + "/" + filename;
let ext = filename
  .split(".")
  .pop()
  .toLowerCase();

let config = {
    createJson: true,
    devMode: true
}

if (ext !== "sor") {
  throw 'only Files with file extension ".sor" allowed';
}


let sor = new SorReader(filepath, config);

var result = "";
const logResult = async function() {
  result = await sor.parse();
  console.log(result);
};
logResult();
