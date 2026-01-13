const https = require('https');
const fs = require('fs');
const path = require('path');

const archivePath = process.argv[2] || 'C:/Users/aless/OneDrive/Documentos/Confeiteiro/confeiteiro_20260113_151156.zip';
const domain = process.argv[3] || 'automacaototal.com';
const apiToken = process.env.API_TOKEN;

if (!apiToken) {
    console.error('API_TOKEN environment variable is required');
    process.exit(1);
}

const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);
const fileBuffer = fs.readFileSync(archivePath);
const fileName = path.basename(archivePath);

const body = Buffer.concat([
    Buffer.from('--' + boundary + '\r\n'),
    Buffer.from('Content-Disposition: form-data; name="archive"; filename="' + fileName + '"\r\n'),
    Buffer.from('Content-Type: application/zip\r\n\r\n'),
    fileBuffer,
    Buffer.from('\r\n--' + boundary + '--\r\n')
]);

const options = {
    hostname: 'developers.hostinger.com',
    path: '/api/hosting/v1/websites/' + domain + '/js-app',
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + apiToken,
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': body.length
    }
};

console.log('Deploying', fileName, 'to', domain, '...');

const req = https.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
    });
});

req.on('error', e => console.error('Error:', e.message));
req.write(body);
req.end();
