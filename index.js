import 'dotenv/config';
import http from 'http';
import crypto from 'crypto';
import {exec} from 'child_process';
const util = require('util');

const run = util.promisify(exec);

const SECRET = process.env.SECRET;
const PORT = process.env.PORT;
const BRANCH = process.env.BRANCH;
const SCRIPT_LOCATION = '~';

let isBusy = false;

http.createServer((req, res) => {
    req.on('data', async chunk => {
        const signature = `sha1=${crypto.createHmac('sha1', SECRET).update(chunk).digest('hex')}`;
        const isAllowed = req.headers['x-hub-signature'] === signature;
        const body = JSON.parse(chunk);
        const isApprovedBranch = body?.ref === `refs/heads/${BRANCH}`;

        console.log(`isAllowed: ${isAllowed}`, `isMaster: ${isApprovedBranch}`);

        if (isAllowed && isApprovedBranch) {
            try {
                if (!isBusy) {
                    console.log('Auto deploy started');
                    isBusy = true;
                    await run(`cd ${SCRIPT_LOCATION} && bash deploy.sh`);
                }
            } catch (error) {
                console.error(error);
            }
        }
    });

    isBusy = false;
    res.writeHead(200);
    res.end();
}).listen(PORT);

console.log(`Listening for webhooks on: ${PORT}`);
