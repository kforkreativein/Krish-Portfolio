import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Enable CORS if needed
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle API dummy route for env update (mirroring Vite plugin)
app.post('/api/update-env', express.json(), (req, res) => {
    // This is a stub for the Vite plugin functionality in production if needed
    res.status(501).json({ error: 'Env update not supported in production server' });
});

// Catch-all to serve index.html for SPA routes
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`
🚀 Server is strictly running on Port ${PORT}
📂 Serving from: ${path.join(__dirname, 'dist')}
🔗 URL: http://localhost:${PORT}
    `);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ ERROR: Port ${PORT} is occupied!`);
        console.error(`Please run: npx kill-port ${PORT} and restart.`);
        process.exit(1);
    } else {
        console.error('Server error:', err);
    }
});
