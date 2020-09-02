import 'dotenv/config';
import http from 'http';
import crypto from 'crypto';
import { exec } from 'child_process';
import Time from './time';

const util = require('util');

const log = (...args) => console.log(Time.get(), ...args);
const error = (...args) => console.error(Time.get(), ...args);
const run = util.promisify(exec);

const { SECRET, PORT, BRANCH } = process.env;
const SCRIPT_LOCATION = '~';

let isBusy = false;
let timestamp = 0;

http
  .createServer((req, res) => {
    req.on('data', async (chunk) => {
      let body;
      const signature = `sha1=${crypto
        .createHmac('sha1', SECRET)
        .update(chunk)
        .digest('hex')}`;
      const isAllowed = req.headers['x-hub-signature'] === signature;
      try {
        body = JSON.parse(chunk);
      } catch (e) {
        log(JSON.stringify(e));
      }
      const isApprovedBranch = body?.ref === `refs/heads/${BRANCH}`;
      log(
        `isAllowed: ${isAllowed}`,
        `isApprovedBranch: ${isApprovedBranch} (exp: ${body?.ref} req: ${BRANCH})`,
      );

      if (isAllowed && isApprovedBranch) {
        try {
          if (!isBusy) {
            timestamp = Date.now();
            log('Auto deploy started...');
            isBusy = true;
            await run(`cd ${SCRIPT_LOCATION} && bash deploy.sh`);
            log('Finished! Time (ms): ', Date.now() - timestamp);
            isBusy = false;
          }
        } catch (err) {
          isBusy = false;
          error(err);
        }
      }
    });

    res.writeHead(200);
    res.end();
  })
  .listen(PORT);

log(`Listening for webhooks on: ${PORT}`);
