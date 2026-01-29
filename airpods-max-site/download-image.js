const fs = require('fs');
const https = require('https');

// Official Apple CDN URL for AirPods Max Silver (High Res Transparent PNG)
const url = "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-select-silver-202011?wid=940&hei=1112&fmt=png-alpha&.v=1604021221000";
const dest = "public/products/airpods-max-select.png";

const file = fs.createWriteStream(dest);
https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, function (response) {
    if (response.statusCode !== 200) {
        console.error(`Failed to download: ${response.statusCode}`);
        response.resume(); // consume response data to free up memory
        return;
    }

    console.log(`Content-Type: ${response.headers['content-type']}`);
    console.log(`Content-Length: ${response.headers['content-length']}`);

    response.pipe(file);
    file.on('finish', function () {
        file.close(() => console.log('Download complete'));
    });
}).on('error', function (err) {
    fs.unlink(dest, () => { });
    console.error('Error:', err.message);
});
