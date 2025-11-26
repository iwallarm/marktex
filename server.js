const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 33133;
const HOST = '0.0.0.0';

// MIME types for different file extensions
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.md': 'text/markdown',
    '.pdf': 'application/pdf'
};

const server = http.createServer((req, res) => {
    // Log request
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);

    // Parse URL
    let filePath = req.url === '/' ? '/index.html' : req.url;

    // Remove query string if present
    filePath = filePath.split('?')[0];

    // Security: prevent directory traversal
    filePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');

    // Full path
    const fullPath = path.join(__dirname, filePath);

    // Check if file exists
    fs.stat(fullPath, (err, stats) => {
        if (err || !stats.isFile()) {
            // File not found
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head><title>404 Not Found</title></head>
                <body>
                    <h1>404 Not Found</h1>
                    <p>The requested file "${filePath}" was not found.</p>
                    <a href="/">Go to MarkTeX Editor</a>
                </body>
                </html>
            `);
            return;
        }

        // Determine content type
        const ext = path.extname(fullPath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        // Read and serve file
        fs.readFile(fullPath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
                return;
            }

            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(data);
        });
    });
});

server.listen(PORT, HOST, () => {
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║   MarkTeX - Scientific Markdown Editor                    ║');
    console.log('║                                                           ║');
    console.log(`║   Server running at: http://localhost:${PORT}              ║`);
    console.log('║                                                           ║');
    console.log('║   Features:                                               ║');
    console.log('║   • LaTeX math rendering with MathJax                     ║');
    console.log('║   • ArXiv-style two-column PDF export                     ║');
    console.log('║   • Auto-save to browser localStorage                     ║');
    console.log('║   • Save/Load markdown files                              ║');
    console.log('║                                                           ║');
    console.log('║   Press Ctrl+C to stop the server                         ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('');
});

// Handle server errors
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Error: Port ${PORT} is already in use.`);
        console.error('Please stop the other process or use a different port.');
    } else {
        console.error('Server error:', err);
    }
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.close(() => {
        console.log('Server stopped.');
        process.exit(0);
    });
});
