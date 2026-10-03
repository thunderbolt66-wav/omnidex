import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Local development fallback for /api/track-visit and /api/admin-telemetry
 */
function localTelemetryPlugin() {
  const localVisits = [];

  return {
    name: 'local-telemetry-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];

        // Track visit endpoint
        if (url === '/api/track-visit' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
              const cleanIp = rawIp.replace(/^.*:/, '') || '127.0.0.1';

              // Detect OS & Browser from UA
              const ua = req.headers['user-agent'] || '';
              let os = 'Windows';
              if (/mac/i.test(ua)) os = 'macOS';
              else if (/iphone|ipad/i.test(ua)) os = 'iOS';
              else if (/android/i.test(ua)) os = 'Android';
              else if (/linux/i.test(ua)) os = 'Linux';

              let browser = 'Chrome';
              if (/edg/i.test(ua)) browser = 'Edge';
              else if (/firefox/i.test(ua)) browser = 'Firefox';
              else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';

              const record = {
                id: `vis_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                ip: cleanIp === '1' ? '127.0.0.1' : cleanIp,
                timestamp: new Date().toISOString(),
                country: 'Local Network',
                city: 'Localhost Node',
                device: data.deviceType || 'Desktop',
                os,
                browser,
                screenResolution: data.screen || '1920x1080',
                language: data.language || 'en-US',
                referrer: data.referrer || 'Direct',
                currentTab: data.tab || 'home',
                activeTheme: data.theme || 'default',
                sessionId: data.sessionId || 'sess_local',
              };

              localVisits.unshift(record);
              if (localVisits.length > 300) localVisits.length = 300;

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, local: true }));
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
          return;
        }

        // Admin telemetry endpoint
        if (url === '/api/admin-telemetry') {
          const authKey = req.headers['x-admin-key'];
          const expectedKey = process.env.ADMIN_SECRET_KEY || 'omnidex-admin-vault-2026';

          if (!authKey || authKey.trim() !== expectedKey) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: 'Access Denied',
                message: 'Invalid or missing Master Admin Key.',
              })
            );
            return;
          }

          if (req.method === 'DELETE') {
            localVisits.length = 0;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, message: 'Local logs wiped.' }));
            return;
          }

          const uniqueIps = new Set(localVisits.map((v) => v.ip)).size;
          const devices = {};
          localVisits.forEach((v) => {
            devices[v.device] = (devices[v.device] || 0) + 1;
          });

          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              authenticated: true,
              generatedAt: new Date().toISOString(),
              summary: {
                totalVisits: localVisits.length,
                uniqueIps,
                countriesCount: 1,
                topCountries: { 'Local Network': localVisits.length },
                deviceBreakdown: devices,
              },
              visitors: localVisits,
            })
          );
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), localTelemetryPlugin()],
  server: {
    headers: {
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    },
  },
  preview: {
    headers: {
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    },
  },
});
