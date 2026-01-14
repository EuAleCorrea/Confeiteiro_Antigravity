const https = require('https');
const apiToken = 'FJ4aZlJzqoDiJUVYnk7ARYWtBr8RcOpzqo9qgzZWfc3f6957';

const options = {
    hostname: 'developers.hostinger.com',
    path: '/api/hosting/v1/websites',
    method: 'GET',
    headers: {
        'Authorization': 'Bearer ' + apiToken,
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Data:', data);
    });
});

req.on('error', e => console.error('Error:', e.message));
req.end();
