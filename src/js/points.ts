export class Points {
  name: string;
  parser: any;
  devMode: boolean;
  pointMap: PointsMap;
  yMin?: number;
  yMax?: number;

  constructor(name: string, parser: any, devMode: boolean) {
    this.name = name;
    this.parser = parser;
    this.devMode = devMode;
    this.pointMap = new PointsMap();
    this.yMin = undefined;
    this.yMax = undefined;
  }
  async loopPoints(num: number, scale: number, resolution: number = 1) {
    let yMin = Infinity;
    let yMax = -Infinity;
    let xScale = 1;
    if (this.devMode) {
      num = 100;
    }
    let valArr: any = [];
    for (let i = 0; i <= num; i++) {
      let param = await this.parser.parseBlock(this.pointMap);
      let y = param.point * scale * 0.001;
      if (y >= yMax) {
        yMax = y;
      }
      if (y <= yMin) {
        yMin = y;
      }
      let x = (resolution * i * xScale) / 1000.0;
      valArr.push([x, y]);
    }
    let mult = yMax;
    let vals = await this.calcOffset(valArr, mult);

    let resObj = {
      yMin: yMin,
      yMax: yMax,
      points: vals,
    };
    this.yMin = yMin;
    this.yMax = yMax;
    return resObj;
  }
  async calcOffset(arr: [], mult: number) {
    let cvalArr = await arr.map(function (nested: any) {
      return nested.map(function (element: any, index: any) {
        if (index === 1) {
          return parseFloat((mult - element).toFixed(6));
        } else {
          return parseFloat(element.toFixed(6));
        }
      });
    });
    return cvalArr;
  }
}

class PointsMap {
  params: object;
  units: object[];
  constructor() {
    this.params = {};
    this.units = [
      {
        name: "point",
        type: "uInt",
        length: 2,
        pres: 6,
      },
    ];
  }
}
