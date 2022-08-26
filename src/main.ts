import "./css/style.css";
import { SorReader } from "./js/sor";
import { Gui } from "./js/gui";

//echarts
let externalScript = document.createElement("script");
externalScript.setAttribute(
  "src",
  "https://cdnjs.cloudflare.com/ajax/libs/echarts/4.6.0/echarts-en.common.min.js"
);
document.head.appendChild(externalScript);

const config = {
  browserMode: true,
};
const UserInterface = new Gui();
const button = document.getElementById("btnLoad");

button?.addEventListener("click", function handleClick() {
  const input = <HTMLElement>document.getElementById("fileinput");

  checkBrowserCompatibility(input);
  UserInterface.clearDivs();
  /**@todo fix the typescript error */
  // @ts-expect-error
  const file = input.files[0];
  const reader = new FileReader();

  if (file.name.includes(".sor")) {
    reader.onload = (res) => {
      if (res != null) {
        let result = res.target!.result;
        parseFile(result);
      }
    };

    reader.onerror = (err) => console.log(err);
    reader.readAsArrayBuffer(file);
  } else {
    // this.message = "only SOR Files allowed";
  }
});

function parseFile(result: any): void {
  let sor = new SorReader(undefined, config, result);
  let data = sor.parse();
  data.then((result) => {
    UserInterface.showResults(result);
  });
}

function checkBrowserCompatibility(input: HTMLElement | null) {
  if (typeof window.FileReader !== "function") {
    flashMessage("The file API isn't supported on this browser yet.");
    return;
  }
  if (!input) {
    flashMessage("Couldn't find the fileinput element.");
    return;
    /**@todo fix the typescript error */
    // @ts-expect-error
  } else if (!input.files) {
    flashMessage(
      "This browser doesn't seem to support the `files` property of file inputs."
    );
    return;
    /**@todo fix the typescript error */
    // @ts-expect-error
  } else if (!input.files[0]) {
    flashMessage("Please select a file before clicking 'Load'", "Warning");
    return;
  }
}

function flashMessage(message: string, type: string = "Alert") {
  const parentMessageDiv = document.getElementById("flashMessage");
  parentMessageDiv!.style.display = "block";
  if (type) {
    parentMessageDiv!.classList.add("message" + type);
  }
  const messageDiv = document.getElementById("message");
  messageDiv!.innerHTML = message;
}
