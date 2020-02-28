class Points {
  constructor(name, parser, devMode) {
    this.name = name;
    this.parser = parser;
    this.devMode = devMode;
    this.pointMap = new PointsMap();
    this.yMin = null;
    this.yMax = null;
  }
  async loopPoints(num, scale, resolution = 1) {
    let yMin = Infinity;
    let yMax = -Infinity;
    let xScale = 1;
    if (this.devMode) {
      num = 100;
    }

    let valArr = [];
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
      points: vals
    };
    this.yMin = yMin;
    this.yMax = yMax;
    return resObj;
  }
  async calcOffset(arr, mult) {
    let cvalArr = await arr.map(function(nested) {
      return nested.map(function(element, index) {
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
  constructor() {
    this.params = {};
    this.units = [
      {
        name: "point",
        type: "uInt",
        length: 2,
        pres: 6
      }
    ];
  }
}

module.exports = Points;
