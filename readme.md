# OTDR-Viewer
This is an simple Online Viewer for SOR Files ("Standard OTDR Record"- Telcordia SR-4731, issue 2 standard). This data Format ist used to store OTDR fiber data.
This is an ES6 Implementation of the Version from [sid5432](https://github.com/sid5432/jsOTDR).

## Introduction
You can use this repo as browser version or node version.
Currently only SOR files from version 2 are supported.

## Example
check out [live example](https://marmoo.de/coding/otdr/).

### start Browser Version
open the "index.html" in your Browser.
Select an SOR File from your Filesystem and click the Button "Load".
Then the SOR file is parsed in the background and the result is displayed in the browser.

### start Node Version
In the file "node.js" the variable "filepath" can be overwritten with the path to the desired SOR file.
Or you can choose one of the suggested samples.

To install the required modules type:
```console
npm install
```
Then the parser can be started with:
```console
node node.js
```
Node now automatically creates a file "result.json". It contains all parameter specifications and measured values.

### bundle with browserify
browserify node.js -o bundle.js

### Config
Some Config parameters can be set.
In the browser version the variable "config" in "main-browser.js" can be adjusted.
In the node version the variable "config" in "node.js" can be adjusted.
The following values can be set:
* debug: false,             // IF true Logging Infos are displayed to Console
* createJson: false,        //only for Node Version. If true results ar wirtten in an File called "result.js"
* jsonPath: '.',            //only for Node Version and if createJson is true. This is the path there the json file is saved
* jsonName: 'result.json',  //if createJson is true this is the name of the json File
* devMode: false,           //For Development: if true only the first 100 DataPoints are read
* browserMode: false        //BrowserMode

## Questions
For questions and support please mail me <moosler@gmx.de>

## Knwon Issues
* SOR Version 1 not supported yet

## License
[MIT](http://opensource.org/licenses/MIT)
Copyright (c) 2019-present, Marco Moosler
