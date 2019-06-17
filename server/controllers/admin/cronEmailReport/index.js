/**
 * HTTP END POINT
 * API controller for the table cron_email_report
 */
const debug = require('debug')('app');
const Cron = require('cron').CronJob;

const db = require('../../../lib/db');
const Moment = require('../../../lib/moment');
const FilterParser = require('../../../lib/filter');

const mailer = require('../../../lib/mailer');
const auth = require('../../auth');
const dbReports = require('../../report.handlers');

const CURRENT_JOBS = [];

function find(options = {}) {
  const filters = new FilterParser(options, { tableAlias : 'cer' });
  const sql = `
    SELECT 
      cer.id, cer.entity_group_uuid, cer.cron_id, cer.report_id, 
      cer.report_url, cer.params, cer.label, cer.last_send,
      cer.next_send, cer.has_dynamic_dates,
      eg.label AS entity_group_label,
      c.label AS cron_label, c.value AS cron_value,
      r.report_key, r.title_key
    FROM cron_email_report cer
    JOIN entity_group eg ON eg.uuid = cer.entity_group_uuid
    JOIN cron c ON c.id = cer.cron_id
    JOIN report r ON r.id = cer.report_id
  `;

  filters.equals('id');
  filters.equals('report_id');
  const query = filters.applyQuery(sql);
  const parameters = filters.parameters();
  return db.exec(query, parameters);
}

function lookup(id) {
  const query = `
    SELECT 
      cer.id, cer.entity_group_uuid, cer.cron_id, cer.report_id, 
      cer.report_url, cer.params, cer.label, cer.last_send,
      cer.next_send, cer.has_dynamic_dates,
      eg.label AS entity_group_label,
      c.label AS cron_label, c.value AS cron_value,
      r.report_key, r.title_key
    FROM cron_email_report cer
    JOIN entity_group eg ON eg.uuid = cer.entity_group_uuid
    JOIN cron c ON c.id = cer.cron_id
    JOIN report r ON r.id = cer.report_id
    WHERE cer.id = ?;
  `;
  return db.one(query, [id]);
}

function list(req, res, next) {
  find(req.query)
    .then(rows => res.status(200).json(rows))
    .catch(next)
    .done();
}

function details(req, res, next) {
  lookup(req.params.id)
    .then((data) => res.status(200).json(data))
    .catch(next)
    .done();
}

function update(req, res, next) {
  const query = `
    UPDATE cron_email_report SET ? WHERE id = ?;
  `;
  const params = req.body;
  if (params.id) {
    delete params.id;
  }
  db.exec(query, [params, req.params.id])
    .then(() => res.sendStatus(204))
    .catch(next)
    .done();
}

function remove(req, res, next) {
  const query = `
    DELETE FROM cron_email_report WHERE id = ?;
  `;
  db.exec(query, [req.params.id])
    .then(() => {
      const [jobToStop] = CURRENT_JOBS.filter(item => {
        return item.id === parseInt(req.params.id, 10);
      });

      if (jobToStop) {
        jobToStop.job.stop();
        debug(`The job for "${jobToStop.label}" is stopped`);
      }
    })
    .then(() => res.sendStatus(204))
    .catch(next)
    .done();
}

async function create(req, res, next) {
  try {
    const query = 'INSERT INTO cron_email_report SET ?;';
    const { cron, reportOptions } = req.body;

    db.convert(cron, ['entity_group_uuid']);
    cron.params = JSON.stringify(reportOptions);

    const result = await db.exec(query, [cron]);
    const created = await lookup(result.insertId);
    await createEmailReportJob(created, sendEmailReportDocument, created);

    res.status(201).json({ id : result.insertId });
  } catch (error) {
    next(error);
  }
}

function send(req, res, next) {
  const { id } = req.params;
  lookup(id)
    .then(record => sendEmailReportDocument(record))
    .then(() => res.sendStatus(201))
    .catch(next);
}

/**
 * @function addJob
 * @description add a cron job to run each time for the given pattern
 * @param {string} frequency Cron job pattern * * * * *
 * @param {function} cb the function to run
 * @param {any} params params of the function
 */
function addJob(frequency, cb, ...params) {
  const cj = new Cron(frequency, () => cb(...params));
  cj.start();
  return cj;
}

/**
 * @method launchCronEmailReportJobs
 * @description at the startup, read all cron email reports
 * in the database and create jobs for them
 */
async function launchCronEmailReportJobs() {
  try {
    const session = await loadSession();
    if (!session.enterprise.settings.enable_auto_email_report) { return; }

    const records = await find();
    if (!records.length) { return; }

    const jobs = records.map(record => createEmailReportJob(record, sendEmailReportDocument, record));
    await Promise.all(jobs);

    debug('Reports scanned successfully');
  } catch (error) {
    // NEED TO BE HANDLED FOR AVOIDING THE CRASH OF THE APPLICATION
    throw error;
  }
}

/**
 * @function createEmailReportJob
 * @param {object} record A row of cron email report
 * @param {*} cb The function to run
 */
function createEmailReportJob(record, cb, ...params) {
  const job = addJob(record.cron_value, cb, ...params);
  CURRENT_JOBS.push({ id : record.id, label : record.label, job });
  return updateCronEmailReportJobDates(record.id, job);
}

/**
 * @function sendEmailReportDocument
 * @param {object} record A row of cron email report
 * @param {object} options The report options
 */
async function sendEmailReportDocument(record) {
  try {
    const reportOptions = JSON.parse(record.params);
    // dynamic dates in the report params if needed
    const options = addDynamicDatesOptions(record.cron_id, record.has_dynamic_dates, reportOptions);
    const fn = dbReports[record.report_key];
    const contacts = await loadContacts(record.entity_group_uuid);
    const session = await loadSession();
    const document = await fn(options, session);
    const filename = replaceSlash(document.headers.filename);

    if (contacts.length) {
      const attachments = [
        { filename, stream : document.report },
      ];
      const content = `
        Hi,

        We have attached to this email the ${filename} file

        Thank you,
      `;
      const mails = contacts.map(c => {
        return mailer.email(c, record.label, content, {
          attachments,
        });
      });

      await Promise.all(mails);
      debug(`(${record.label}) report sent by email to ${contacts.length} contacts`);
    }
  } catch (e) {
    throw e;
  }
}

function replaceSlash(name = '', value = '_') {
  const regex = /\//gi;
  return name.replace(regex, value);
}

function loadContacts(entityGroupUuid) {
  const query = `
    SELECT e.email FROM entity e
    JOIN entity_group_entity ege ON ege.entity_uuid = e.uuid
    JOIN entity_group eg ON eg.uuid = ege.entity_group_uuid
    WHERE eg.uuid = ?; 
  `;
  return db.exec(query, [entityGroupUuid])
    .then(contacts => contacts.map(c => c.email));
}

function loadSession() {
  const query = `
    SELECT
      user.id, user.username, user.display_name, user.email, user.deactivated,
      project.enterprise_id , project.id AS project_id
    FROM user
      JOIN project_permission
      JOIN project ON user.id = project_permission.user_id
      AND project.id = project_permission.project_id
      LIMIT 1`;

  return db.one(query)
    .then(user => auth.loadSessionInformation(user));
}

function addDynamicDatesOptions(cronId, hasDynamicDates, options) {
  // cron ids
  const DAILY = 1;
  const WEEKLY = 2;
  const MONTHLY = 3;
  const YEARLY = 4;

  const period = new Moment(new Date());

  if (hasDynamicDates) {
    if (cronId === DAILY) {
      options.dateFrom = period.day().dateFrom;
      options.dateTo = period.day().dateTo;
      options.custom_period_start = period.day().dateFrom;
      options.custom_period_end = period.day().dateTo;
    }

    if (cronId === WEEKLY) {
      options.dateFrom = period.week().dateFrom;
      options.dateTo = period.week().dateTo;
      options.custom_period_start = period.week().dateFrom;
      options.custom_period_end = period.week().dateTo;
    }

    if (cronId === MONTHLY) {
      options.dateFrom = period.month().dateFrom;
      options.dateTo = period.month().dateTo;
      options.custom_period_start = period.month().dateFrom;
      options.custom_period_end = period.month().dateTo;
    }

    if (cronId === YEARLY) {
      options.dateFrom = period.year().dateFrom;
      options.dateTo = period.year().dateTo;
      options.custom_period_start = period.year().dateFrom;
      options.custom_period_end = period.year().dateTo;
    }
  }
  return options;
}

function updateCronEmailReportJobDates(id, job) {
  const sql = `
    UPDATE cron_email_report SET ? WHERE id = ?;
  `;
  const params = {
    last_send : job.lastDate() ? job.lastDate().toDate() : null,
    next_send : job.nextDate() ? job.nextDate().toDate() : null,
  };
  return db.exec(sql, [params, id]);
}

launchCronEmailReportJobs();

exports.list = list;
exports.details = details;
exports.update = update;
exports.remove = remove;
exports.create = create;
exports.send = send;
