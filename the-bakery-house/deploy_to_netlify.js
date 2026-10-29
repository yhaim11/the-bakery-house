/**
 * סקריפט פריסה מקומי ל-Netlify עבור בית האפיות (The Bakery House)
 * אורז את קובצי הפרויקט ושולח ישירות ל-API של Netlify
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const PROJECT_DIR = __dirname;
const SITE_ID = '92ada39a-453a-48fe-aa97-04f537f0978d'; // the-bakery-house-app
const NETLIFY_TOKEN = 'nfp_pQkgGiGKUPjWx8SUBCmMu2miayPd8LC2a699';
const ZIP_PATH = path.join(PROJECT_DIR, 'the_bakery_house_deploy.zip');

// בדיקת בטיחות
const FORBIDDEN_SITES = [
  'c6927a30-6175-4b05-8313-7472f46a3a44', // artisan-bakery-management
  'b4dfb436-da3e-4f1c-aa9b-260a8ea195bb'  // keshets-kennel
];

if (FORBIDDEN_SITES.includes(SITE_ID)) {
  console.error("🚨 שגיאת בידוד: ניסיון לפרוס על אתר אחר שאינו בית האפיות!");
  process.exit(1);
}

console.log('📦 אורז את קובצי בית האפיות (The Bakery House)...');

// אריזה באמצעות package_zip.ps1
try {
  execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${path.join(PROJECT_DIR, 'package_zip.ps1')}"`, { stdio: 'inherit' });
} catch (e) {
  console.error("שגיאה בהפעלת package_zip.ps1:", e.message);
  process.exit(1);
}

console.log('🚀 שולח פריסה ל-Netlify עבור the-bakery-house-app...');
const zipBuffer = fs.readFileSync(ZIP_PATH);

const options = {
  hostname: 'api.netlify.com',
  path: `/api/v1/sites/${SITE_ID}/deploys`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${NETLIFY_TOKEN}`,
    'Content-Type': 'application/zip',
    'Content-Length': zipBuffer.length,
    'User-Agent': 'BakeryHouseDeployer/1.0'
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const deploy = JSON.parse(body);
      console.log('\n🎉 אתר "בית האפיות" נפרס בהצלחה רבה!');
      console.log(`🆔 Deploy ID: ${deploy.id}`);
      console.log(`📊 State: ${deploy.state}`);
      console.log(`🔗 Live URL: ${deploy.ssl_url || deploy.url}`);
    } else {
      console.error(`❌ פריסה נכשלה (קוד ${res.statusCode}):`, body);
    }
  });
});

req.on('error', (err) => {
  console.error('Request error:', err);
});

req.write(zipBuffer);
req.end();
