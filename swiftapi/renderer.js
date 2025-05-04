// Import required modules
const { ipcRenderer } = require("electron");

// Wait for the DOM to be loaded
document.addEventListener("DOMContentLoaded", () => {
  // Load React and ReactDOM
  const React = require("react");
  const ReactDOM = require("react-dom");

  // Import our InputDesign component
  const InputDesign = require("./components/InputDesign").default;

  // Render the InputDesign component to the app container
  ReactDOM.render(
    React.createElement(InputDesign),
    document.getElementById("app"),
  );

  // Set up any IPC communication needed for the app
  ipcRenderer.on("message-from-main", (event, message) => {
    console.log("Received message from main process:", message);
  });

  // You can add more event listeners and functionality here
});

// Handle any errors that occur during rendering
window.addEventListener("error", (event) => {
  console.error("Error in renderer process:", event.error);
});
