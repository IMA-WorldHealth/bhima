/* eslint no-console:"off" */
const exec = require('child_process').exec;
const crypto = require('crypto');

// apparently "promisifying" an exec call is not recommended.
function wrapChildProcessInPromise(child) {
  return new Promise((resolve, reject) => {
    child.addListener('error', (code, signal) => {
      console.log('ChildProcess error', code, signal);
      reject();
    });
    child.addListener('exit', (code, signal) => {
      if (code === 0) {
        resolve();
      } else {
        reject();
      }
    });
  });
}

exports.random = () => crypto.randomBytes(8).toString('hex');
exports.execute = (command) => wrapChildProcessInPromise(exec(command));
