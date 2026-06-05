const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIP() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (!iface.internal && iface.family === 'IPv4') {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const ip = getLocalIP();
const envPath = path.join(__dirname, '..', '.env');
const envContent = `# QUANTUM FIT - App Móvil
# IP detectada automáticamente: ${ip}

EXPO_PUBLIC_API_URL=http://${ip}:3000/api
EXPO_PUBLIC_SOCKET_URL=http://${ip}:3000
`;

fs.writeFileSync(envPath, envContent);
console.log(`✅ IP detectada: ${ip}`);
console.log(`📝 .env actualizado`);
