/**
 * @overview mailer
 *
 * @description
 * This module contains a wrapper for SMTP emailing.
 *
 * @requires nodemailer
 * @requires debug
 */

const debug = require('debug')('bhima:mailer');
const nodemailer = require('nodemailer');

// get ENV variables.
const {
  SMTP_HOST,
  SMTP_USERNAME,
  SMTP_PASSWORD,
} = process.env;

let mailer;

function setupSMTPTransport() {
  debug(`Using ${SMTP_HOST} for email transport.`);
  const transport = nodemailer.createTransport({
    host : SMTP_HOST,
    port : 587,
    secure : false,
    auth : { user : SMTP_USERNAME, pass : SMTP_PASSWORD },
  }, { from : SMTP_USERNAME });

  // check SMTP credentials
  transport.verify((err) => {
    if (err) {
      debug(`Error connecting to ${SMTP_HOST}.`);
      debug(`Error: ${JSON.stringify(err)}`);
    } else {
      debug(`${SMTP_HOST} is ready to accept connections.`);
    }
  });

  // alias sendMail() as send();
  transport.send = transport.sendMail;
  return transport;
}

// only set up transports
if (SMTP_HOST && SMTP_USERNAME && SMTP_PASSWORD) {
  mailer = setupSMTPTransport();
}

/**
 * @method email
 *
 * @description
 * This function implements emailing with nicer handling of file names than the
 * default smtp library.
 */
exports.email = async function email(address, subject, message, options = {}) {
  if (!mailer) {
    debug(`#email() mail transport not set up.  Skipping...`);
    return 0;
  }

  debug(`#email() sending email "${subject}" to ${address}.`);

  // attachments:
  // https://nodemailer.com/message/attachments/
  const { attachments } = options;

  const mail = {
    to : address,
    subject,
    attachment : attachments,
    text : message,
  };

  if (options.bcc) {
    debug(`#email(): BCC-ed addresses: `, options.bcc.join(', '));
    Object.assign(mail, { bcc : options.bcc });
  }

  const result = await mailer.send(mail);

  debug(`#email() sent.  Result is:`, result);
  return result;
};
