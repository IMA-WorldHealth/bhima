/**
 * This controller is responsible of handling merge of patients into
 * one patient.
 *
 * The merge consists to :
 * - get debtor_uuids of the selected patient (patient to keep) and others patients (patients to remove)
 * - replace all occurences of debtor_uuid of patient to remove by the debtor_uuid
 *   of the selected patient (patient to keep) in journal and general ledger
 *   cash, debtor_group_history, invoice, patient, employee, patient_assignment,
 *   patient_document, patient_hospitalization, patient_visit
 * - remove the patient to remove
 * - remove the debtor relate to patient to remove
 */
const db = require('../../../lib/db');

exports.mergePatients = mergePatients;

function mergePatients(req, res, next) {
  const params = req.body;
  const glb = {};

  const selectedPatientUuid = db.bid(params.selected);
  const otherPatientUuids = params.other.map(uuid => db.bid(uuid));

  const getSelectedDebtorUuid = `SELECT debtor_uuid FROM patient WHERE uuid = ?`;
  const getOtherDebtorUuids = `SELECT debtor_uuid FROM patient WHERE uuid IN (?)`;

  const replaceDebtorInJournal = `
    UPDATE posting_journal SET entity_uuid = ? WHERE entity_uuid IN (?);
  `;
  const replaceDebtorInLedger = `
    UPDATE general_ledger SET entity_uuid = ? WHERE entity_uuid IN (?);
  `;
  const replaceDebtorInCash = `
    UPDATE cash SET debtor_uuid = ? WHERE debtor_uuid IN (?);
  `;
  const replaceDebtorInDebtorGroupHistory = `
    UPDATE debtor_group_history SET debtor_uuid = ? WHERE debtor_uuid IN (?);
  `;
  const replaceDebtorInInvoice = `
    UPDATE invoice SET debtor_uuid = ? WHERE debtor_uuid IN (?);
  `;
  const replaceDebtorInPatient = `
    UPDATE patient SET debtor_uuid = ? WHERE debtor_uuid IN (?);
  `;
  const replacePatientInEmployee = `
    UPDATE employee SET patient_uuid = ? WHERE patient_uuid IN (?);
  `;
  const replacePatientInPatientAssignment = `
    UPDATE patient_assignment SET patient_uuid = ? WHERE patient_uuid IN (?);
  `;
  const replacePatientInPatientDocument = `
    UPDATE patient_document SET patient_uuid = ? WHERE patient_uuid IN (?);
  `;
  const replacePatientInPatientHospitalization = `
    UPDATE patient_hospitalization SET patient_uuid = ? WHERE patient_uuid IN (?);
  `;
  const replacePatientInPatientVisit = `
    UPDATE patient_visit SET patient_uuid = ? WHERE patient_uuid IN (?);
  `;

  const removeOtherDebtors = `
    DELETE FROM debtor WHERE uuid IN (?);
  `;
  const removeOtherPatients = `
    DELETE FROM patient WHERE uuid IN (?);
  `;

  db.one(getSelectedDebtorUuid, [selectedPatientUuid])
    .then(row => {
      glb.selectedDebtorUuid = row.debtor_uuid;
      return db.exec(getOtherDebtorUuids, otherPatientUuids);
    })
    .then(rows => {
      glb.otherDebtorUuids = rows.map(row => row.debtor_uuid);

      const transaction = db.transaction();

      transaction.addQuery(replaceDebtorInJournal, [glb.selectedDebtorUuid, [glb.otherDebtorUuids]]);
      transaction.addQuery(replaceDebtorInLedger, [glb.selectedDebtorUuid, [glb.otherDebtorUuids]]);

      transaction.addQuery(replaceDebtorInCash, [glb.selectedDebtorUuid, [glb.otherDebtorUuids]]);
      transaction.addQuery(replaceDebtorInDebtorGroupHistory, [glb.selectedDebtorUuid, [glb.otherDebtorUuids]]);
      transaction.addQuery(replaceDebtorInInvoice, [glb.selectedDebtorUuid, [glb.otherDebtorUuids]]);
      transaction.addQuery(replaceDebtorInPatient, [glb.selectedDebtorUuid, [glb.otherDebtorUuids]]);

      transaction.addQuery(replacePatientInEmployee, [selectedPatientUuid, [otherPatientUuids]]);
      transaction.addQuery(replacePatientInPatientAssignment, [selectedPatientUuid, [otherPatientUuids]]);
      transaction.addQuery(replacePatientInPatientDocument, [selectedPatientUuid, [otherPatientUuids]]);
      transaction.addQuery(replacePatientInPatientHospitalization, [selectedPatientUuid, [otherPatientUuids]]);
      transaction.addQuery(replacePatientInPatientVisit, [selectedPatientUuid, [otherPatientUuids]]);

      transaction.addQuery(removeOtherPatients, [otherPatientUuids]);
      transaction.addQuery(removeOtherDebtors, [glb.otherDebtorUuids]);
      return transaction.execute();
    })
    .then(() => {
      res.sendStatus(204);
    })
    .catch(next)
    .done();
}
