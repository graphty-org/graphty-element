#!/usr/bin/env node

const { spawn } = require('child_process');
const https = require('https');
const httpProxy = require('http-proxy');
const fs = require('fs');
const path = require('path');

// Configuration
const PROXY_PORT = 9003;
const UI_PORT = 9002;
const UI_HOST = '0.0.0.0';

// Create self-signed certificate if it doesn't exist
const certPath = path.join(__dirname, 'localhost-cert.pem');
const keyPath = path.join(__dirname, 'localhost-key.pem');

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
  console.log('⚠️  No certificates found. Please run:');
  console.log('   npx mkcert localhost dev.ato.ms');
  console.log('   mv localhost+1.pem scripts/localhost-cert.pem');
  console.log('   mv localhost+1-key.pem scripts/localhost-key.pem');
  console.log('\nOr for quick self-signed (with browser warnings):');
  console.log('   npx local-ssl-proxy --source 9003 --target 9002');
  process.exit(1);
}

// Start Playwright UI
console.log(`🎭 Starting Playwright UI on port ${UI_PORT}...`);
const playwright = spawn('npx', [
  'playwright',
  'test',
  '--ui',
  `--ui-port=${UI_PORT}`,
  `--ui-host=${UI_HOST}`
], {
  stdio: 'inherit',
  shell: true
});

// Wait a bit for Playwright to start
setTimeout(() => {
  // Create HTTPS proxy
  const proxy = httpProxy.createProxyServer({
    target: `http://localhost:${UI_PORT}`,
    ws: true,
    changeOrigin: true
  });

  // Handle proxy errors
  proxy.on('error', (err) => {
    console.error('Proxy error:', err.message);
  });

  // Create HTTPS server
  const server = https.createServer({
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath)
  }, (req, res) => {
    proxy.web(req, res);
  });

  // Handle WebSocket upgrades (for live updates)
  server.on('upgrade', (req, socket, head) => {
    proxy.ws(req, socket, head);
  });

  server.listen(PROXY_PORT, () => {
    console.log(`\n✅ HTTPS proxy running!`);
    console.log(`🔒 Access Playwright UI at: https://dev.ato.ms:${PROXY_PORT}`);
    console.log(`\n⚠️  If you see certificate warnings, see instructions above.`);
  });

  // Clean shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    playwright.kill();
    server.close();
    process.exit(0);
  });
}, 2000);

// Exit when Playwright exits
playwright.on('exit', (code) => {
  console.log(`Playwright UI exited with code ${code}`);
  process.exit(code);
});