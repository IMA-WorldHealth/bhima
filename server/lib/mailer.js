/**
 * @overview mailer
 *
 * @description
 * This module contains a wrapper for mailgun-js.
 *
 * @requires q
 * @requires path
 * @requires fs
 * @requires mailgun-js
 * @requires debug
 */

const q = require('q');
const path = require('path');
const fs = require('fs');
const debug = require('debug')('mailer');

const mailgun = require('mailgun-js')({
  apiKey : process.env.MAILGUN_API_KEY,
  domain : process.env.MAILGUN_DOMAIN,
});

const SERVER_ADDRESS = process.env.MAILGUN_SERVER_ADDRESS;

/**
 * @function processAttachments
 *
 * @description
 * A function to asynchronously load attachments using promises.
 */
function processAttachments(attachments = []) {
  debug(`#processAttachments() processing ${attachments.length} attachments.`);
  // convert to an array as needed
  return q.all([].concat(attachments)
    .map(attach => {
      // default to the name of the file if the name has not been specified
      attach.filename = attach.filename || path.parse(attach.path).base;

      if (!attach.stream) {
        debug(`#processAttachments() loading ${attach.path}`);

        // asynchronously load the file and add it as as an attachment
        return fs.promises.readFile(attach.path)
          .then(file => new mailgun.Attachment({ filename : attach.filename, data : file }));
      }

      debug(`#processAttachments() attach stream ${attach.filename}`);

      // asynchronously load the file and add it as as an attachment
      return new mailgun.Attachment({ filename : attach.filename, data : attach.stream });

    }));
}

/**
 * @function sendp
 *
 * @description
 * A promise wrapper for mailgun's send() function.
 */
function sendp(mail) {
  const deferred = q.defer();
  mailgun.messages().send(mail, (err, body) => {
    if (err) {
      debug('#email(): sending failed with error: %j', err);
      return deferred.reject(err);
    }
    return deferred.resolve(body);
  });

  return deferred.promise;
}

/**
 * @method email
 *
 * @description
 * This function implements emailing with nicer handling of file names than the
 * default mailgunjs library.  If attachments are provided, they are converted
 * into mailgun attachments with either their filename as the attachment name or
 * a default.
 */
exports.email = async function email(address, subject, message, options = {}) {
  debug(`#email() sending email ${subject} to ${address}.`);
  const attachments = await processAttachments(options.attachments);

  const mail = {
    from : SERVER_ADDRESS,
    to : address,
    subject,
    attachment : attachments,
    text : message,
  };

  if (options.bcc) {
    debug(`#email(): BCC-ed addresses: `, options.bcc.join(', '));
    Object.assign(mail, { bcc : options.bcc });
  }

  return sendp(mail);
};
