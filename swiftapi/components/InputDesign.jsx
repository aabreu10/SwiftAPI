"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import "./InputDesign.css";

function InputDesign() {
  const [method, setMethod] = useState(() => "GET");
  const [url, setUrl] = useState(() => "");
  const [headers, setHeaders] = useState(() => ({}));
  const [body, setBody] = useState(() => "");
  const [response, setResponse] = useState(() => null);
  const [isLoading, setIsLoading] = useState(() => false);
  const [headerEntries, setHeaderEntries] = useState(() => [{ key: "", value: "" }]);
  const [activeTab, setActiveTab] = useState("headers");
  const [errors, setErrors] = useState({
    url: "",
    headers: "",
    body: ""
  });
    { key: "", value: "" },
  ]);

  const handleHeaderChange = (index, field, value) => {
    const newHeaderEntries = [...headerEntries];
    newHeaderEntries[index][field] = value;

    const newHeaders = {};
    const keys = new Set();
    let hasDuplicates = false;

    newHeaderEntries.forEach(entry => {
      if (entry.key.trim() !== "") {
        if (keys.has(entry.key.trim().toLowerCase())) {
          hasDuplicates = true;
        }
        keys.add(entry.key.trim().toLowerCase());
        newHeaders[entry.key] = entry.value;
      }
    });

    setHeaderEntries(newHeaderEntries);
    setHeaders(newHeaders);

    if (hasDuplicates) {
      setErrors(prev => ({ ...prev, headers: "Duplicate header keys detected" }));
    } else {
      setErrors(prev => ({ ...prev, headers: "" }));
    }
  };

  const addHeaderEntry = () => {
    setHeaderEntries([...headerEntries, { key: "", value: "" }]);
  };

  const removeHeaderEntry = (index) => {
    if (headerEntries.length > 1) {
      const newHeaderEntries = headerEntries.filter((_, i) => i !== index);
      setHeaderEntries(newHeaderEntries);

      const newHeaders = {};
      newHeaderEntries.forEach((entry) => {
        if (entry.key.trim() !== "") {
          newHeaders[entry.key] = entry.value;
        }
      });

      setHeaders(newHeaders);
    }
  };

  useEffect(() => {
    if (!url) {
      setErrors(prev => ({ ...prev, url: "" }));
      return;
    }

    try {
      new URL(url);
      setErrors(prev => ({ ...prev, url: "" }));
    } catch (e) {
      setErrors(prev => ({ ...prev, url: "Please enter a valid URL" }));
    }
  }, [url]);

  // Validate JSON body when applicable
    if (method === "GET" || !body.trim()) {
      setErrors(prev => ({ ...prev, body: "" }));
      return;
    }

    try {
      JSON.parse(body);
      setErrors(prev => ({ ...prev, body: "" }));
    } catch (e) {
      setErrors(prev => ({ ...prev, body: "Invalid JSON format" }));
    }
  }, [body, method]);

  async function sendRequest() {
    // Validate before sending
    if (errors.url || errors.headers || errors.body) {
    }

    if (!url.trim()) {
      setErrors(prev => ({ ...prev, url: "URL is required" }));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(url, {
        method: method,
        headers: headers,
        body: method !== "GET" ? body : undefined,
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        setResponse(await response.json());
      } else {
        const text = await response.text();
        setResponse({
          status: response.status,
          statusText: response.statusText,
          body: text
        });
      }
    } catch (error) {
      setResponse({
        error: error.message,
      });
    }
    setIsLoading(false);
  }

  return (
    <div className="api-request-container">
      <div className="request-header">
        <div className="method-url-container">
          <select
            value={method}
            onChange={(event) => setMethod(event.target.value)}
            className="method-select"
            aria-label="HTTP Method"
            title="Select HTTP method for your request"
          >
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>DELETE</option>
          </select>

          <div className="url-input-container">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter request URL"
              className={`url-input ${errors.url ? 'input-error' : ''}`}
              aria-label="Request URL"
              title="Enter the full URL for your API request"
            />
            {errors.url && <div className="error-message">{errors.url}</div>}
          </div>

          <button
            onClick={sendRequest}
            disabled={isLoading || !url || errors.url || errors.headers || errors.body}
            className="send-button"
            title="Send the API request"
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>

      <div className="request-body-container">
        <div className="tabs">
          <div
            className={`tab ${activeTab === 'headers' ? 'active' : ''}`}
            onClick={() => setActiveTab('headers')}
            title="Configure request headers"
          >
            Headers
          </div>
          <div
            className={`tab ${activeTab === 'body' ? 'active' : ''} ${method === 'GET' ? 'disabled-tab' : ''}`}
            onClick={() => method !== 'GET' && setActiveTab('body')}
            title={method === 'GET' ? 'Body not available for GET requests' : 'Configure request body'}
          >
            Body
          </div>
          <div
            className={`tab ${activeTab === 'docs' ? 'active' : ''}`}
            onClick={() => setActiveTab('docs')}
            title="View documentation"
          >
            Docs
          </div>
        </div>

        <div className="tab-content">
          <div className={`headers-container ${activeTab !== 'headers' ? 'hidden' : ''}`}>
            {errors.headers && <div className="error-message">{errors.headers}</div>}
            {headerEntries.map((entry, index) => (
              <div key={index} className="header-entry">
                <input
                  type="text"
                  value={entry.key}
                  onChange={(e) =>
                    handleHeaderChange(index, "key", e.target.value)
                  }
                  placeholder="Header name"
                  className="header-key-input"
                />
                <input
                  type="text"
                  value={entry.value}
                  onChange={(e) =>
                    handleHeaderChange(index, "value", e.target.value)
                  }
                  placeholder="Value"
                  className="header-value-input"
                />
                <button
                  onClick={() => removeHeaderEntry(index)}
                  className="remove-header-button"
                >
                  ✕
                </button>
              </div>
            ))}
            <button onClick={addHeaderEntry} className="add-header-button">
              Add Header
            </button>
          </div>

          <div className={`body-container ${activeTab !== 'body' || method === 'GET' ? 'hidden' : ''}`}>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Request body (JSON, text, etc.)"
              className={`body-textarea ${errors.body ? 'input-error' : ''}`}
              aria-label="Request body"
              title="Enter the request body in JSON format"
            />
            {errors.body && <div className="error-message">{errors.body}</div>}
            <div className="helper-text">
              <button
                className="format-button"
                onClick={() => {
                  try {
                    const formatted = JSON.stringify(JSON.parse(body), null, 2);
                    setBody(formatted);
                    setErrors(prev => ({ ...prev, body: "" }));
                  } catch (e) {
                    setErrors(prev => ({ ...prev, body: "Invalid JSON format" }));
                  }
                }}
                disabled={!body.trim()}
                title="Format JSON"
              >
                Format JSON
              </button>
            </div>
          </div>

          <div className={`docs-container ${activeTab !== 'docs' ? 'hidden' : ''}`}>
            <h3>Quick Help</h3>
            <div className="docs-section">
              <h4>HTTP Methods</h4>
              <ul>
                <li><strong>GET</strong>: Retrieve data from the server</li>
                <li><strong>POST</strong>: Send data to create a resource</li>
                <li><strong>PUT</strong>: Update an existing resource</li>
                <li><strong>DELETE</strong>: Remove a resource</li>
              </ul>
            </div>
            <div className="docs-section">
              <h4>Common Headers</h4>
              <ul>
                <li><strong>Content-Type</strong>: application/json</li>
                <li><strong>Authorization</strong>: Bearer [token]</li>
                <li><strong>Accept</strong>: application/json</li>
              </ul>
            </div>
            <div className="docs-section">
              <h4>Tips</h4>
              <ul>
                <li>Use valid JSON in the request body</li>
                <li>Include authentication headers when required</li>
                <li>Check response status codes for errors</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="response-container">
        <h3 className="response-title">Response</h3>
        <div className="response-content">
          {response ? (
            <pre className="response-json">
              {JSON.stringify(response, null, 2)}
            </pre>
          ) : (
            <div className="no-response">No response yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InputDesign;