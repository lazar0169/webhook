import 'dotenv/config';
import http from 'http';
import crypto from 'crypto';
import {exec} from 'child_process';

const SECRET = process.env.SECRET;
const PORT = process.env.PORT;
const SCRIPT_LOCATION = '~';

http.createServer((req, res) => {
    req.on('data', chunk => {
        const signature = `sha1=${crypto.createHmac('sha1', SECRET).update(chunk).digest('hex')}`;
        const isAllowed = req.headers['x-hub-signature'] === signature;
        const body = JSON.parse(chunk);
        const isMaster = body?.ref === 'refs/heads/master';

        console.log(`isAllowed: ${isAllowed}`, `isMaster: ${isMaster}`);

        if (isAllowed && isMaster) {
            try {
                exec(`cd ${SCRIPT_LOCATION} && bash deploy.sh`);
            } catch (error) {
                console.log(error);
            }
        }
    });

    res.writeHead(200);
    res.end();
}).listen(PORT);

console.log(`Listening for webhooks on: ${PORT}`);
