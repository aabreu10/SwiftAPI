(() => {
  
  const state = {
    method: "GET",
    url: "",
    headers: [],
    body: "",
    headerPresets: {
      json: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      form: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      auth: {
        Authorization: "Bearer ",
      },
    },
    response: null,
    fullResponse: null,
    isLoading: false,
    dropdownOpen: false,
    folders: [],
    activeFolder: null,
    activeRequest: null,
    responseChunkSize: 1000,
    currentChunk: 1,
    currentRequestId: null,
  };

  
  const elements = {
    methodSelect: document.querySelector(".method-select"),
    methodDropdown: document.querySelector(".method-dropdown"),
    methodButton: document.querySelector(".method-select-button"),
    selectedMethod: document.querySelector(".selected-method"),
    dropdownOptions: document.querySelector(".dropdown-options"),
    dropdownArrow: document.querySelector(".dropdown-arrow"),
    urlInput: document.querySelector(".url-input"),
    jsonButton: document.querySelector(".json-button"),
    authButton: document.querySelector(".auth-button"),
    headerItems: document.querySelector(".header-items"),
    addHeaderButton: document.querySelector(".add-header-button"),
    bodyTextarea: document.querySelector(".body-textarea"),
    sendButton: document.querySelector(".animated-button"),
    responseContent: document.querySelector(".response-content"),
    noResponse: document.querySelector(".no-response"),
    viewMoreContainer: document.getElementById("view-more-container"),
    viewMoreButton: document.getElementById("view-more-button"),
    headerItemTemplate: document.getElementById("header-item-template"),
    folderTemplate: document.getElementById("folder-template"),
    requestTemplate: document.getElementById("request-template"),
    foldersList: document.getElementById("folders-list"),
    createFolderButton: document.getElementById("create-folder-button"),
    saveRequestButton: document.getElementById("save-request-button"),
    createFolderModal: document.getElementById("create-folder-modal"),
    saveRequestModal: document.getElementById("save-request-modal"),
    folderNameInput: document.getElementById("folder-name"),
    requestNameInput: document.getElementById("request-name"),
    folderSelect: document.getElementById("folder-select"),
    cancelFolderButton: document.getElementById("cancel-folder"),
    confirmFolderButton: document.getElementById("confirm-folder"),
    cancelRequestButton: document.getElementById("cancel-request"),
    confirmRequestButton: document.getElementById("confirm-request"),
    toggleSidebarButton: document.getElementById("toggle-sidebar"),
    sidebar: document.querySelector(".sidebar"),
  };

  function checkMobile() {
    if (window.innerWidth <= 768) {
      elements.toggleSidebarButton.classList.remove("hidden");
    } else {
      elements.toggleSidebarButton.classList.add("hidden");
      elements.sidebar.classList.remove("active");
    }
  }

  function toggleSidebar() {
    elements.sidebar.classList.toggle("active");
  }

  function loadFolders() {
    const savedFolders = localStorage.getItem("requestFolders");
    if (savedFolders) {
      state.folders = JSON.parse(savedFolders);
      renderFolders();
    }
  }

  function saveFolders() {
    localStorage.setItem("requestFolders", JSON.stringify(state.folders));
  }

  function renderFolders() {
    elements.foldersList.innerHTML = "";

    if (state.folders.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.textContent = "No folders yet";
      emptyMessage.style.color = "rgb(139, 148, 158)";
      emptyMessage.style.textAlign = "center";
      emptyMessage.style.padding = "16px 0";
      elements.foldersList.appendChild(emptyMessage);
      return;
    }

    state.folders.forEach((folder, folderIndex) => {
      const folderItem = elements.folderTemplate.content.cloneNode(true);
      const folderHeader = folderItem.querySelector(".folder-header");
      const folderContent = folderItem.querySelector(".folder-content");
      const folderIcon = folderItem.querySelector(".folder-icon");
      const folderName = folderItem.querySelector(".folder-name");
      const addRequestButton = folderItem.querySelector(".add-request-button");
      const requestList = folderItem.querySelector(".request-list");

      folderName.textContent = folder.name;

      folderHeader.addEventListener("click", (e) => {
        if (e.target.closest(".add-request-button")) return;

        const isOpen = folderContent.classList.contains("open");
        if (isOpen) {
          folderContent.classList.remove("open");
          folderIcon.classList.remove("open");
        } else {
          folderContent.classList.add("open");
          folderIcon.classList.add("open");
        }
      });

      addRequestButton.addEventListener("click", () => {
        state.activeFolder = folderIndex;
        state.activeRequest = null;
        state.currentRequestId = null;

        showSaveRequestModal(true);
      });

      if (folder.requests.length === 0) {
        const emptyMessage = document.createElement("div");
        emptyMessage.textContent = "No requests in this folder";
        emptyMessage.className = "empty-folder-message";
        requestList.appendChild(emptyMessage);
      } else {
        folder.requests.forEach((request, requestIndex) => {
          const requestItem = elements.requestTemplate.content.cloneNode(true);
          const requestElement = requestItem.querySelector(".request-item");
          const requestName = requestItem.querySelector(".request-name");
          const requestMethod = requestItem.querySelector(".request-method");
          const requestUrl = requestItem.querySelector(".request-url");
          const deleteButton = requestItem.querySelector(
            ".delete-request-button",
          );

          requestName.textContent = request.name;
          requestMethod.textContent = request.method;
          requestMethod.classList.add(`method-${request.method.toLowerCase()}`);
          requestUrl.textContent = request.url;

          if (
            state.activeFolder === folderIndex &&
            state.activeRequest === requestIndex
          ) {
            requestElement.classList.add("active");
            folderContent.classList.add("open");
            folderIcon.classList.add("open");
          }

          requestElement.addEventListener("click", (e) => {
            if (e.target.closest(".delete-request-button")) return;
            loadRequest(folderIndex, requestIndex);
          });

          deleteButton.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteRequest(folderIndex, requestIndex, request.name);
          });

          requestList.appendChild(requestItem);
        });
      }

      elements.foldersList.appendChild(folderItem);
    });

    
    updateFolderSelect();
  }

  function createFolder() {
    const folderName = elements.folderNameInput.value.trim();

    if (!folderName) {
      alert("Please enter a name for this folder");
      return;
    }

    const newFolder = {
      id: Date.now(),
      name: folderName,
      requests: [],
    };

    state.folders.push(newFolder);
    state.activeFolder = state.folders.length - 1;

    saveFolders();
    renderFolders();
    hideCreateFolderModal();
  }

  function updateFolderSelect() {
    elements.folderSelect.innerHTML = "";

    state.folders.forEach((folder, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = folder.name;
      elements.folderSelect.appendChild(option);
    });

    if (state.activeFolder !== null) {
      elements.folderSelect.value = state.activeFolder;
    }
  }

  function loadRequest(folderIndex, requestIndex) {
    const request = state.folders[folderIndex].requests[requestIndex];

    state.activeFolder = folderIndex;
    state.activeRequest = requestIndex;
    state.currentRequestId = request.id;
    state.method = request.method;
    state.url = request.url;
    state.headers = [...request.headers];
    state.body = request.body;

    elements.selectedMethod.textContent = request.method;
    elements.methodSelect.value = request.method;
    elements.urlInput.value = request.url;
    elements.bodyTextarea.value = request.body;

    document.querySelectorAll(".dropdown-option").forEach((option) => {
      if (option.getAttribute("data-value") === request.method) {
        option.classList.add("selected");
      } else {
        option.classList.remove("selected");
      }
    });

    renderHeaders();
    renderFolders();
  }

  function showCreateFolderModal() {
    elements.folderNameInput.value = "";
    elements.createFolderModal.classList.add("active");
  }

  function hideCreateFolderModal() {
    elements.createFolderModal.classList.remove("active");
  }

  function generateRequestName() {
    let name = "";
    try {
      const urlObj = new URL(state.url);
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      if (pathParts.length > 0) {
        name = pathParts[pathParts.length - 1];
      } else {
        name = urlObj.hostname;
      }
    } catch (e) {
      name = "request";
    }

    return `${state.method} ${name}`;
  }

  function saveRequestDirectly() {
    if (state.folders.length === 0) {
      showCreateFolderModal();
      return;
    }

    let folderIndex = state.activeFolder;
    if (
      folderIndex === null ||
      folderIndex < 0 ||
      folderIndex >= state.folders.length
    ) {
      folderIndex = 0;
    }

    let requestName;

    if (
      state.currentRequestId &&
      state.activeRequest !== null &&
      state.activeFolder !== null
    ) {
      requestName =
        state.folders[state.activeFolder].requests[state.activeRequest].name;
    } else {
      requestName = generateRequestName();
    }

    const newRequest = {
      id: state.currentRequestId || Date.now(),
      name: requestName,
      method: state.method,
      url: state.url,
      headers: [...state.headers],
      body: state.body,
    };

    if (state.currentRequestId) {
      if (state.activeFolder !== null && state.activeRequest !== null) {
        state.folders[state.activeFolder].requests[state.activeRequest] =
          newRequest;
        saveFolders();
        renderFolders();
        return;
      }

      for (let i = 0; i < state.folders.length; i++) {
        const requestIndex = state.folders[i].requests.findIndex(
          (req) => req.id === state.currentRequestId,
        );

        if (requestIndex !== -1) {
          state.folders[i].requests[requestIndex] = newRequest;
          state.activeFolder = i;
          state.activeRequest = requestIndex;

          saveFolders();
          renderFolders();
          return;
        }
      }
    }

    state.folders[folderIndex].requests.push(newRequest);
    state.activeRequest = state.folders[folderIndex].requests.length - 1;
    state.activeFolder = folderIndex;
    state.currentRequestId = newRequest.id;

    saveFolders();
    renderFolders();
  }

  
  function showSaveRequestModal(isNewRequest) {
    
    let folderIndex = state.activeFolder;
    if (
      folderIndex === null ||
      folderIndex < 0 ||
      folderIndex >= state.folders.length
    ) {
      folderIndex = 0; 
    }

    
    updateFolderSelect();
    elements.folderSelect.value = folderIndex;

    
    const suggestedName = generateRequestName();
    elements.requestNameInput.value = isNewRequest ? "" : suggestedName;
    elements.requestNameInput.placeholder = suggestedName;

    
    elements.saveRequestModal.classList.add("active");
  }

  
  function hideSaveRequestModal() {
    elements.saveRequestModal.classList.remove("active");
  }

  
  function deleteRequest(folderIndex, requestIndex, requestName) {
    
    if (
      confirm(`Are you sure you want to delete the request "${requestName}"?`)
    ) {
      
      state.folders[folderIndex].requests.splice(requestIndex, 1);

      
      if (
        state.activeFolder === folderIndex &&
        state.activeRequest === requestIndex
      ) {
        state.activeRequest = null;
        state.currentRequestId = null;

        
        elements.urlInput.value = "";
        elements.bodyTextarea.value = "";
        state.url = "";
        state.body = "";
        state.headers = [];
        renderHeaders();
      } else if (
        state.activeFolder === folderIndex &&
        state.activeRequest > requestIndex
      ) {
        
        state.activeRequest--;
      }

      
      saveFolders();
      renderFolders();
    }
  }

  
  function saveRequest() {
    const requestName = elements.requestNameInput.value.trim();
    const folderIndex = parseInt(elements.folderSelect.value);

    if (!requestName) {
      
      elements.requestNameInput.value = generateRequestName();
      return saveRequest(); 
    }

    if (
      isNaN(folderIndex) ||
      folderIndex < 0 ||
      folderIndex >= state.folders.length
    ) {
      
      const firstFolderIndex = 0;
      elements.folderSelect.value = firstFolderIndex;
      return saveRequest(); 
    }

    const newRequest = {
      id: state.currentRequestId || Date.now(),
      name: requestName,
      method: state.method,
      url: state.url,
      headers: [...state.headers],
      body: state.body,
    };

    
    if (
      state.currentRequestId &&
      state.activeFolder === folderIndex &&
      state.activeRequest !== null
    ) {
      state.folders[folderIndex].requests[state.activeRequest] = newRequest;
    } else {
      
      state.folders[folderIndex].requests.push(newRequest);
      state.activeRequest = state.folders[folderIndex].requests.length - 1;
    }

    state.activeFolder = folderIndex;
    state.currentRequestId = newRequest.id;

    saveFolders();
    renderFolders();
    hideSaveRequestModal();
  }

  
  function setupEventListeners() {
    
    elements.methodButton.addEventListener("click", toggleDropdown);
    document.addEventListener("click", closeDropdownOnClickOutside);

    
    document.querySelectorAll(".dropdown-option").forEach((option) => {
      option.addEventListener("click", (e) => {
        selectMethod(e.target.getAttribute("data-value"));
      });
    });

    
    elements.methodButton.addEventListener("keydown", handleDropdownKeyboard);

    
    elements.urlInput.addEventListener("input", onUrlChange);
    elements.jsonButton.addEventListener("click", () => applyPreset("json"));
    elements.authButton.addEventListener("click", () => applyPreset("auth"));
    elements.addHeaderButton.addEventListener("click", addHeader);
    elements.bodyTextarea.addEventListener("input", onBodyChange);
    elements.sendButton.addEventListener("click", sendRequest);

    
    elements.viewMoreButton.addEventListener("click", loadMoreResponse);

    
    elements.createFolderButton.addEventListener(
      "click",
      showCreateFolderModal,
    );
    elements.cancelFolderButton.addEventListener(
      "click",
      hideCreateFolderModal,
    );
    elements.confirmFolderButton.addEventListener("click", createFolder);

    
    elements.saveRequestButton.addEventListener("click", () => {
      if (state.currentRequestId) {
        saveRequestDirectly();
      } else {
        showSaveRequestModal(true);
      }
    });
    elements.cancelRequestButton.addEventListener(
      "click",
      hideSaveRequestModal,
    );
    elements.confirmRequestButton.addEventListener("click", saveRequest);

    
    if (elements.toggleSidebarButton) {
      elements.toggleSidebarButton.addEventListener("click", toggleSidebar);
    }

    
    window.addEventListener("resize", checkMobile);
  }

  
  function toggleDropdown(e) {
    e.preventDefault();
    state.dropdownOpen = !state.dropdownOpen;
    updateDropdownUI();
  }

  function closeDropdownOnClickOutside(e) {
    if (state.dropdownOpen && !elements.methodDropdown.contains(e.target)) {
      state.dropdownOpen = false;
      updateDropdownUI();
    }
  }

  function updateDropdownUI() {
    if (state.dropdownOpen) {
      elements.dropdownOptions.classList.add("open");
      elements.dropdownArrow.classList.add("open");
    } else {
      elements.dropdownOptions.classList.remove("open");
      elements.dropdownArrow.classList.remove("open");
    }
  }

  function selectMethod(method) {
    state.method = method;
    elements.selectedMethod.textContent = method;
    elements.methodSelect.value = method;

    
    document.querySelectorAll(".dropdown-option").forEach((option) => {
      if (option.getAttribute("data-value") === method) {
        option.classList.add("selected");
      } else {
        option.classList.remove("selected");
      }
    });

    
    state.dropdownOpen = false;
    updateDropdownUI();
  }

  function handleDropdownKeyboard(e) {
    const options = Array.from(document.querySelectorAll(".dropdown-option"));
    const currentIndex = options.findIndex(
      (opt) => opt.getAttribute("data-value") === state.method,
    );

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        toggleDropdown(e);
        break;
      case "Escape":
        if (state.dropdownOpen) {
          e.preventDefault();
          state.dropdownOpen = false;
          updateDropdownUI();
        }
        break;
      case "ArrowDown":
        if (state.dropdownOpen) {
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % options.length;
          selectMethod(options[nextIndex].getAttribute("data-value"));
        } else {
          toggleDropdown(e);
        }
        break;
      case "ArrowUp":
        if (state.dropdownOpen) {
          e.preventDefault();
          const prevIndex =
            (currentIndex - 1 + options.length) % options.length;
          selectMethod(options[prevIndex].getAttribute("data-value"));
        } else {
          toggleDropdown(e);
        }
        break;
    }
  }

  
  function onUrlChange(event) {
    state.url = event.target.value;
  }

  function onBodyChange(event) {
    state.body = event.target.value;
  }

  function onHeaderCheckboxChange(event, index) {
    state.headers[index].enabled = event.target.checked;
  }

  function onHeaderKeyChange(event, index) {
    state.headers[index].key = event.target.value;
  }

  function onHeaderValueChange(event, index) {
    state.headers[index].value = event.target.value;
  }

  
  function addHeader() {
    state.headers.push({
      key: "",
      value: "",
      enabled: true,
    });
    renderHeaders();
  }

  function removeHeader(index) {
    state.headers.splice(index, 1);
    renderHeaders();
  }

  function applyPreset(preset) {
    const presetHeaders = Object.entries(state.headerPresets[preset]).map(
      ([key, value]) => ({
        key,
        value,
        enabled: true,
      }),
    );
    state.headers = [...state.headers, ...presetHeaders];
    renderHeaders();
  }

  function renderHeaders() {
    elements.headerItems.innerHTML = "";

    state.headers.forEach((header, index) => {
      const headerItem = elements.headerItemTemplate.content.cloneNode(true);

      const checkbox = headerItem.querySelector(".header-checkbox");
      const keyInput = headerItem.querySelector(".header-name-input");
      const valueInput = headerItem.querySelector(".header-value-input");
      const removeButton = headerItem.querySelector(".remove-header-button");

      checkbox.checked = header.enabled;
      keyInput.value = header.key;
      valueInput.value = header.value;

      checkbox.addEventListener("change", (e) =>
        onHeaderCheckboxChange(e, index),
      );
      keyInput.addEventListener("input", (e) => onHeaderKeyChange(e, index));
      valueInput.addEventListener("input", (e) =>
        onHeaderValueChange(e, index),
      );
      removeButton.addEventListener("click", () => removeHeader(index));

      elements.headerItems.appendChild(headerItem);
    });
  }

  
  function updateResponseDisplay() {
    if (state.response) {
      
      state.fullResponse =
        typeof state.response === "object"
          ? JSON.stringify(state.response, null, 2)
          : state.response;

      
      state.currentChunk = 1;

      
      displayResponseChunk();

      elements.responseContent.classList.remove("hidden");
      elements.noResponse.classList.add("hidden");
    } else {
      elements.responseContent.classList.add("hidden");
      elements.noResponse.classList.remove("hidden");
      elements.viewMoreContainer.classList.add("hidden");
    }
  }

  function displayResponseChunk() {
    const fullText = state.fullResponse;
    const chunkSize = state.responseChunkSize;
    const totalChunks = Math.ceil(fullText.length / chunkSize);
    const endIndex = state.currentChunk * chunkSize;

    
    elements.responseContent.textContent = fullText.substring(0, endIndex);

    
    if (state.currentChunk < totalChunks) {
      elements.viewMoreContainer.classList.remove("hidden");
      elements.viewMoreButton.textContent = `View more (${state.currentChunk}/${totalChunks})`;
      elements.viewMoreButton.classList.remove("expanded");
    } else {
      
      if (totalChunks > 1) {
        elements.viewMoreContainer.classList.remove("hidden");
        elements.viewMoreButton.textContent = "View less";
        elements.viewMoreButton.classList.add("expanded");
      } else {
        elements.viewMoreContainer.classList.add("hidden");
      }
    }
  }

  function loadMoreResponse() {
    if (elements.viewMoreButton.classList.contains("expanded")) {
      
      state.currentChunk = 1;
    } else {
      
      state.currentChunk++;
    }

    
    displayResponseChunk();

    
    elements.viewMoreContainer.scrollIntoView({ behavior: "smooth" });
  }

  
  async function sendRequest(e) {
    e.preventDefault();

    if (!state.url) {
      alert("Please enter a URL");
      return;
    }

    setLoading(true);

    try {
      
      const headers = new Headers();
      state.headers.forEach((header) => {
        if (header.enabled && header.key) {
          headers.append(header.key, header.value);
        }
      });

      
      const options = {
        method: state.method,
        headers: headers,
      };

      
      if (state.method !== "GET" && state.body) {
        options.body = state.body;
      }

      
      const response = await fetch(state.url, options);

      
      try {
        state.response = await response.json();
      } catch (e) {
        
        state.response = await response.text();
      }

      
      updateResponseDisplay();
    } catch (error) {
      state.response = { error: error.message };
      updateResponseDisplay();
    } finally {
      setLoading(false);
    }
  }

  function setLoading(isLoading) {
    state.isLoading = isLoading;
    elements.sendButton.disabled = isLoading;

    if (isLoading) {
      elements.sendButton.querySelector(".text").textContent = "Sending...";
    } else {
      elements.sendButton.querySelector(".text").textContent = "Send request";
    }
  }

  
  function init() {
    setupEventListeners();
    loadFolders();
    renderHeaders();
    checkMobile();
  }

  
  document.addEventListener("DOMContentLoaded", init);
  
  
  window.clearAllData = function() {
    localStorage.removeItem("requestFolders");
    state.folders = [];
    state.activeFolder = null;
    state.activeRequest = null;
    state.currentRequestId = null;
    renderFolders();
  };
})();

