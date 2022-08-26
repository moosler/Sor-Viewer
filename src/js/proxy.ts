import {Genparam as GenParams} from './genparams';
import {Supparam as SupParams} from './supparams';
import {Fxdparam as FxdParams} from './fxdparams';
import {Keyevent as KeyEvents} from './keyevents';
import {Datapoints as DataPts} from './datapts';
import {Cksum} from './cksum';

const classes = {
    GenParams,
    SupParams,
    FxdParams,
    KeyEvents,
    DataPts,
    Cksum,
};

export class Proxy {
    // className:Genparam | Supparam | Fxdparam | Keyevent | Datapoints | Cksum | undefined;
    className:GenParams | SupParams | FxdParams | KeyEvents | DataPts | Cksum | undefined|string;
    constructor(className:GenParams | SupParams | FxdParams | KeyEvents | DataPts | Cksum | undefined|string, opts:string = "") {
        // @ts-ignore
        return new classes[className](opts);
    }
}
