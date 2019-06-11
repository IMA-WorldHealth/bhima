/**
 * HTTP END POINT
 * API controller for the table cron_email_report
 */
const db = require('../../../lib/db');

function list(req, res, next) {
  const query = `
    SELECT 
      cer.id, cer.entity_group_uuid, cer.cron_id, cer.report_id, 
      cer.report_url, cer.params, cer.label, cer.last_send,
      cer.next_send, cer.is_last_send_succeed,
      eg.label AS entity_group_label,
      c.label AS cron_label, c.value AS cron_value,
      r.report_key, r.title_key
    FROM cron_email_report cer
    JOIN entity_group eg ON eg.uuid = cer.entity_group_uuid
    JOIN cron c ON c.id = cer.cron_id
    JOIN report r ON r.id = cer.report_id
  `;
  db.exec(query)
    .then(rows => res.status(200).json(rows))
    .catch(next)
    .done();
}

function details(req, res, next) {
  const query = `
    SELECT 
      cer.id, cer.entity_group_uuid, cer.cron_id, cer.report_id, 
      cer.report_url, cer.params, cer.label, cer.last_send,
      cer.next_send, cer.is_last_send_succeed,
      eg.label AS entity_group_label,
      c.label AS cron_label, c.value AS cron_value,
      r.report_key, r.title_key
    FROM cron_email_report cer
    JOIN entity_group eg ON eg.uuid = cer.entity_group_uuid
    JOIN cron c ON c.id = cer.cron_id
    JOIN report r ON r.id = cer.report_id
    WHERE cer.id = ?;
  `;
  db.one(query, [req.params.id])
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
    .then(() => res.sendStatus(204))
    .catch(next)
    .done();
}

function create(req, res, next) {
  const query = `
    INSERT INTO cron_email_report SET ?;
  `;
  const { cron, report } = req.body;
  db.convert(cron, ['entity_group_uuid']);
  cron.params = JSON.stringify(report);

  db.exec(query, [cron])
    .then((result) => {
      res.status(201).json({ id : result.insertId });
    })
    .catch(next)
    .done();
}

exports.list = list;
exports.details = details;
exports.update = update;
exports.remove = remove;
exports.create = create;
