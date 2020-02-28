//https://stackoverflow.com/questions/3146483/html5-file-api-read-as-text-and-binary

const trPrefix = "t_";
const config = {
  browserMode: true
};

function loadFile() {
  var input, file, fr;

  if (typeof window.FileReader !== "function") {
    bodyAppend("p", "The file API isn't supported on this browser yet.");
    return;
  }
  clearDivs();
  input = document.getElementById("fileinput");
  if (!input) {
    bodyAppend("p", "Um, couldn't find the fileinput element.");
  } else if (!input.files) {
    bodyAppend(
      "p",
      "This browser doesn't seem to support the `files` property of file inputs."
    );
  } else if (!input.files[0]) {
    bodyAppend("p", "Please select a file before clicking 'Load'");
  } else {
    file = input.files[0];
    fr = new FileReader();
    fr.onload = function(event) {
      let result = event.target.result;

   
      let sor = new SorReader(
        false,
        config,
        result
      );
      let data = sor.parse();
      data.then(function(result) {
        this.showResults(result);
      });
    };
    fr.readAsArrayBuffer(file);
  }
}

function clearDivs() {
  let divs = ["result", "event-sum"];
  divs.forEach(element => {
    document.getElementById(element).innerHTML = "";
  });
}

async function showResults(data) {
  let props = await createPropertyList(data.params);
  await this.writeToDiv(props, "result");
  drawChart(data.points, data.events);
  let events = await getEvents(data.events, data.summary);
  await writeToDiv(events, "event-sum");
}

/** * append Innerhtml  */
async function writeToDiv(data, idName, waitTime = 1) {
  return Promise.resolve().then(function() {
    setTimeout(function() {
      document.getElementById(idName).innerHTML += data;
    }, waitTime);
    return result;
  });
}

/** * Properties  */
async function createPropertyList(data) {
  let html = `<ul>`;
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const element = data[key];
      if (typeof element === "object" && element !== null) {
        html += `<li><b>${key}: </b>${await createPropertyList(element)}</li>`;
      } else {
        html += `<li><b>${key}: </b>${element}</li>`;
      }
    }
  }
  html += `</ul>`;

  return html;
}

/** Chart */

async function drawChart(points, events) {
  let marker = await getMarkers(events);
  drawEchart(points, marker);
}
async function getMarkers(events, type = "xAxis", y = 30) {
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
            formatter: function(param) {
              return [param.name];
            }
          }
        };
      } else {
        obj = {
          name: "Event " + element.number,
          coord: [element.distance, y],
          value: distance
        };
      }
      markers.push(obj);
    }
  }
  return markers;
}
/**Apache Echart */
function drawEchart(points, markers) {
  var myChart = echarts.init(document.getElementById("chartContainer"));

  let option = {
    animation: false,
    title: {
      left: "center",
      text: "OTDR Trace Graph"
    },
    tooltip: {
      trigger: "axis",
      formatter: function(param) {
        param = param[0];
        return [
          "dB: " + param.data[1] + '<hr size=1 style="margin: 3px 0">',
          "km: " + param.data[0] + "<br/>"
        ].join("");
      }
    },
    toolbox: {
      feature: {
        dataZoom: {},
        saveAsImage: {}
      }
    },
    xAxis: {
      name: "Distance (km)",
      nameTextStyle: {
        fontWeight: "bold"
      },
      splitNumber: 10
    },
    yAxis: {
      name: "Refelction (dB)",
      nameTextStyle: {
        fontWeight: "bold"
      },
      max: function(value) {
        return value.max + 10;
      }
      // splitNumber: 10
    },
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 100
      },
      {
        start: 0,
        end: 100
      }
    ],
    dataset: {
      source: points.points
    },
    series: [
      {
        type: "line",
        symbol: "none",
        // sampling: "max",
        itemStyle: {
          color: "#4f81bc"
        },
        encode: {
          x: 0,
          y: 1
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
          data: markers
        }
      }
    ]
  };
  myChart.setOption(option);

  /** Event Handling */
  myChart.on("mouseover", function(params) {
    let arrIndex = parseInt(params.name);
    let id = trPrefix + arrIndex;
    highlight_row(id);
  });
}

/** Table Events */
async function getEvents(events, summary) {
  let html = ``;
  html += await createTable(summary, "Summary", "sum-table");
  html += await createTable(events, "Events", "event-table");
  return html;
}

async function createTable(data, name, id = "") {
  let html = `<h3>${name}</h3>`;
  html += `<table id='${id}'>`;
  if (Array.isArray(data)) {
    html += await getHeaders(data[0]);
  } else {
    html += await getHeaders(data);
  }
  html += await this.getTableBody(data);
  html += `</table>`;

  return html;
}
async function getTableBody(data) {
  let html = `<tbody>`;
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      let id = "";
      if (element.hasOwnProperty("number")) {
        id = trPrefix + element.number;
      }
      html += `<tr class='${id}'>`;
      html += await this.getTd(element);
      html += `</tr>`;
    }
  } else {
    html += `<tr>`;
    html += await this.getTd(data);
    html += `</tr>`;
  }

  html += `</tbody>`;
  return html;
}

async function getTd(data) {
  let html = "";
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const element = data[key];
      html += `<td>${element}</td>`;
    }
  }
  return html;
}
async function getHeaders(data) {
  let html = `<thead><tr>`;
  for (const key in data) {
    html += `<th>${key}</th>`;
  }
  html += `</tr></thead>`;
  return html;
}

function highlight_row(className) {
  unHighlightAllRoWs();
  var row = document.getElementsByClassName(className);
  if (row) {
    row[0].className += " selected";
  }
}
function unHighlightAllRoWs(idName = "event-table") {
  var table = document.getElementById(idName);
  var rows = table.getElementsByTagName("tr");
  for (var row = 0; row < rows.length; row++) {
    rows[row].classList.remove("selected");
  }
}
