/**
 * @todo handle prefix from UserInterface
 */
const trPrefix = "t_";

export class Chart {
  prefix: string;
  constructor(prefix: string) {
    this.prefix = prefix;
  }
  async draw(points: any, events: any) {
    let marker = await this.getMarkers(events);
    this.drawEchart(points, marker);
  }
  async getMarkers(
    events: { [x: string]: any; hasOwnProperty: (arg0: string) => any },
    type = "xAxis",
    y = 30
  ) {
    let markers = [];
    for (const key in events) {
      if (events.hasOwnProperty(key)) {
        const element = events[key];
        let obj = {};
        let distance = Number.parseFloat(element.distance).toFixed(2);
        if (type === "xAxis") {
          obj = {
            name: element.number,
            xAxis: distance,
            label: {
              formatter: function (param: { name: any }) {
                return [param.name];
              },
            },
          };
        } else {
          obj = {
            name: "Event " + element.number,
            coord: [element.distance, y],
            value: distance,
          };
        }
        markers.push(obj);
      }
    }
    return markers;
  }
  /**Apache Echart */
  drawEchart(points: { points: any }, markers: {}[]) {
    /**@todo fix the typescript error */
    // @ts-expect-error
    var myChart = echarts.init(document.getElementById("chartContainer"));

    let option = {
      animation: false,
      title: {
        left: "center",
        text: "OTDR Trace Graph",
      },
      tooltip: {
        trigger: "axis",
        formatter: function (param: any[]) {
          param = param[0];
          return [
            /**@todo fix the typescript error */
            // @ts-expect-error
            "dB: " + param.data[1] + '<hr size=1 style="margin: 3px 0">',
            /**@todo fix the typescript error */
            // @ts-expect-error
            "km: " + param.data[0] + "<br/>",
          ].join("");
        },
      },
      toolbox: {
        feature: {
          dataZoom: {},
          saveAsImage: {},
        },
      },
      xAxis: {
        name: "Distance (km)",
        nameTextStyle: {
          fontWeight: "bold",
        },
        splitNumber: 10,
      },
      yAxis: {
        name: "Refelction (dB)",
        nameTextStyle: {
          fontWeight: "bold",
        },
        max: function (value: { max: number }) {
          return value.max + 10;
        },
        // splitNumber: 10
      },
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 100,
        },
        {
          start: 0,
          end: 100,
        },
      ],
      dataset: {
        source: points.points,
      },
      series: [
        {
          type: "line",
          symbol: "none",
          // sampling: "max",
          itemStyle: {
            color: "#4f81bc",
          },
          encode: {
            x: 0,
            y: 1,
          },
          // markPoint: {
          //   symbol: "diamond",
          //   symbolSize: 10,
          //   label: {
          //     position: "top"
          //   },
          //   data: markers
          // },
          markLine: {
            silent: false,
            symbol: "none",
            data: markers,
          },
        },
      ],
    };
    myChart.setOption(option);

    /** Event Handling */
    myChart.on("mouseover", function (params: { name: string }) {
      let arrIndex = parseInt(params.name);
      let id = trPrefix + arrIndex;
      highlight_row(id);
    });
  }
}

/**
 * @todo move this to Gui Class
 * @param className
 */
function highlight_row(className: string) {
  unHighlightAllRoWs();
  var row = document.getElementsByClassName(className);
  if (row) {
    row[0].className += " selected";
  }
}
function unHighlightAllRoWs(idName = "event-table") {
  var table = document.getElementById(idName);
  var rows = table?.getElementsByTagName("tr");
  for (var row = 0; row < rows!.length; row++) {
    rows![row].classList.remove("selected");
  }
}
