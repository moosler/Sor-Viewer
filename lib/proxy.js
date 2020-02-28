const GenParams = require('./genparams');
const SupParams = require('./supparams');
const FxdParams = require('./fxdparams');
const KeyEvents = require('./keyevents');
const DataPts = require('./datapts');
const Cksum = require('./cksum');

const classes = {
    GenParams,
    SupParams,
    FxdParams,
    KeyEvents,
    DataPts,
    Cksum,
};

class Proxy {
    constructor(className, opts = "") {
        return new classes[className](opts);
    }
}

module.exports = Proxy;