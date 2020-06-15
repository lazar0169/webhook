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
let timestamp = 0;

http.createServer((req, res) => {
    req.on('data', async chunk => {
        let body;
        const signature = `sha1=${crypto.createHmac('sha1', SECRET).update(chunk).digest('hex')}`;
        const isAllowed = req.headers['x-hub-signature'] === signature;
        try {
            body = JSON.parse(chunk);
        } catch (e) {
            console.log(JSON.stringify(e));
        }
        const isApprovedBranch = body?.ref === `refs/heads/${BRANCH}`;
        console.log(`isAllowed: ${isAllowed}`, `isApprovedBranch: ${isApprovedBranch} (exp: ${body?.ref} req: ${BRANCH})`);

        if (isAllowed && isApprovedBranch) {
            try {
                if (!isBusy) {
                    timestamp = Date.now();
                    console.log('Auto deploy started...');
                    isBusy = true;
                    await run(`cd ${SCRIPT_LOCATION} && bash deploy.sh`);
                    console.log('Finished! Time (ms): ', Date.now() - timestamp);
                    isBusy = false;
                }
            } catch (error) {
                isBusy = false;
                console.error(error);
            }
        }

    });

    res.writeHead(200);
    res.end();
}).listen(PORT);

console.log(`Listening for webhooks on: ${PORT}`);
