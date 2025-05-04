# Swift API

A lightweight, user-friendly API testing tool built with Electron and React.

## Features

- Simple and intuitive interface for API testing
- Support for multiple HTTP methods (GET, POST, PUT, DELETE)
- Custom header management
- JSON request body editor with formatting
- Response visualization
- Mobile-friendly responsive design
- Form validation to prevent errors

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/swiftapi.git

# Navigate to the project directory
cd swiftapi

# Install dependencies
npm install

# Start the application
npm start
```

## Usage

### Making API Requests

1. **Select an HTTP Method**: Choose from GET, POST, PUT, or DELETE depending on your API endpoint requirements.

2. **Enter the URL**: Input the full URL of the API endpoint you want to test.

3. **Add Headers** (Optional): Click on the "Headers" tab to add custom headers to your request.

   - Common headers include:
     - `Content-Type: application/json`
     - `Authorization: Bearer YOUR_TOKEN`
     - `Accept: application/json`

4. **Add Request Body** (for POST, PUT, DELETE): Click on the "Body" tab to add a request body in JSON format.

   - Use the "Format JSON" button to properly format your JSON.

5. **Send the Request**: Click the "Send" button to execute the API request.

6. **View the Response**: The response will be displayed in the response section at the bottom of the application.

### Validation

The application includes validation to help prevent common errors:

- **URL Validation**: Ensures the URL is properly formatted
- **Header Validation**: Prevents duplicate header keys
- **JSON Validation**: Verifies that the request body contains valid JSON (when applicable)

## Development

### Project Structure

```
swiftapi/
├── components/
│   ├── InputDesign.jsx    # Main API request interface component
│   └── InputDesign.css    # Styles for the component
├── index.js               # Main Electron process
├── preload.js             # Preload script for Electron
├── renderer.js            # Renderer process script
├── index.html             # Main HTML file
└── package.json           # Project dependencies and scripts
```

### Building from Source

```bash
# Install dependencies
npm install

# Run in development mode
npm start

# Build for production
npm run build
```

## Troubleshooting

### Common Issues

1. **Network Errors**: If you receive network errors, check your internet connection and verify the URL is correct.

2. **CORS Issues**: If you encounter CORS (Cross-Origin Resource Sharing) errors, you may need to use a proxy or modify the API server to allow requests from your application.

3. **JSON Parsing Errors**: Ensure your JSON is properly formatted in the request body. Use the "Format JSON" button to help with this.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
