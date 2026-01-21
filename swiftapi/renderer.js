const { ipcRenderer } = require("electron");

document.addEventListener("DOMContentLoaded", () => {
  const React = require("react");
  const ReactDOM = require("react-dom");

  const InputDesign = require("./components/InputDesign").default;

  ReactDOM.render(
    React.createElement(InputDesign),
    document.getElementById("app"),
  );

  ipcRenderer.on("message-from-main", (event, message) => {
    console.log("Received message from main process:", message);
  });

});

window.addEventListener("error", (event) => {
  console.error("Error in renderer process:", event.error);
});
