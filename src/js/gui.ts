import { Chart } from "./chart";

export class Gui {
  chart: Chart;
  trPrefix: string;
  constructor() {
    this.trPrefix = "t_";
    this.chart = new Chart(this.trPrefix);
  }

  clearDivs() {
    let divs = ["result", "event-sum"];
    divs.forEach((element) => {
      document.getElementById(element)!.innerHTML = "";
    });
  }

  async showResults(data: {
    params: any;
    points: any;
    events: any;
    summary: any;
  }) {
    let props = await this.createPropertyList(data.params);
    await this.writeToDiv(props, "result");
    this.chart.draw(data.points, data.events);
    let events = await this.getEvents(data.events, data.summary);
    await this.writeToDiv(events, "event-sum");
  }
  /** * Properties  */
  async createPropertyList(data: {
    [x: string]: any;
    hasOwnProperty: (arg0: string) => any;
  }) {
    let html = `<ul>`;
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const element = data[key];
        if (typeof element === "object" && element !== null) {
          html += `<li><b>${key}: </b>${await this.createPropertyList(
            element
          )}</li>`;
        } else {
          html += `<li><b>${key}: </b>${element}</li>`;
        }
      }
    }
    html += `</ul>`;
    return html;
  }

  /** * append Innerhtml  */
  async writeToDiv(data: string, idName: string, waitTime = 1) {
    return Promise.resolve().then(function () {
      setTimeout(function () {
        document.getElementById(idName)!.innerHTML += data;
      }, waitTime);
    });
  }
  /** Table Events */
  async getEvents(events: any, summary: any) {
    let html = ``;
    html += await this.createTable(summary, "Summary", "sum-table");
    html += await this.createTable(events, "Events", "event-table");
    return html;
  }

  async createTable(data: any[], name: string, id = "") {
    let html = `<h3>${name}</h3>`;
    html += `<table id='${id}'>`;
    if (Array.isArray(data)) {
      html += await this.getHeaders(data[0]);
    } else {
      html += await this.getHeaders(data);
    }
    html += await this.getTableBody(data);
    html += `</table>`;

    return html;
  }
  async getTableBody(data: any[]) {
    let html = `<tbody>`;
    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const element = data[i];
        let id = "";
        if (element.hasOwnProperty("number")) {
          id = this.trPrefix + element.number;
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
  async getTd(data: []) {
    let html = "";
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const element = data[key];
        html += `<td>${element}</td>`;
      }
    }
    return html;
  }
  async getHeaders(data: any) {
    let html = `<thead><tr>`;
    for (const key in data) {
      html += `<th>${key}</th>`;
    }
    html += `</tr></thead>`;
    return html;
  }
}
