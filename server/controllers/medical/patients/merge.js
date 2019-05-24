/**
 * This controller is responsible of handling merge of patients into
 * one patient.
 *
 * The merge consists to :
 * - get debtor_uuids of the selected patients and others
 * - replace all occurences of debtor_uuid of patient to remove by the debtor_uuid
 *   of the selected patient in journal and general ledger
 * - remove the not selected patient
 * - recalculate period total
 */
const db = require('../../../lib/db');

exports.mergePatients = mergePatients;

function mergePatients(req, res, next) {
  const params = req.body;
  const glb = {};

  const selectedUuid = db.bid(params.selected);
  const otherUuids = params.other.map(uuid => db.bid(uuid));

  const getSelectedDebtorUuid = `SELECT debtor_uuid FROM patient WHERE uuid = ?`;
  const getOtherDebtorUuid = `SELECT debtor_uuid FROM patient WHERE uuid IN (?)`;

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
    UPDATE patient_assignment SET patient_uuid = ? WHERE patient_uuid IN (?);
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

  db.one(getSelectedDebtorUuid, [selectedUuid])
    .then(row => {
      glb.selectedDebtorUuid = row.debtor_uuid;
      return db.exec(getOtherDebtorUuid, otherUuids);
    })
    .then(rows => {
      glb.otherDebtorUuids = rows.map(row => row.debtor_uuid);

      const transaction = db.transaction();
      console.log('>>>', glb.selectedDebtorUuid, glb.otherDebtorUuids);
      transaction.addQuery(replaceDebtorInJournal, [glb.selectedDebtorUuid, glb.otherDebtorUuids]);
      transaction.addQuery(replaceDebtorInLedger, [glb.selectedDebtorUuid, glb.otherDebtorUuids]);

      transaction.addQuery(replaceDebtorInCash, [glb.selectedDebtorUuid, glb.otherDebtorUuids]);
      transaction.addQuery(replaceDebtorInDebtorGroupHistory, [glb.selectedDebtorUuid, glb.otherDebtorUuids]);
      transaction.addQuery(replaceDebtorInInvoice, [glb.selectedDebtorUuid, glb.otherDebtorUuids]);
      transaction.addQuery(replaceDebtorInPatient, [glb.selectedDebtorUuid, glb.otherDebtorUuids]);

      transaction.addQuery(replacePatientInEmployee, [selectedUuid, otherUuids]);
      transaction.addQuery(replacePatientInPatientAssignment, [selectedUuid, otherUuids]);
      transaction.addQuery(replacePatientInPatientDocument, [selectedUuid, otherUuids]);
      transaction.addQuery(replacePatientInPatientHospitalization, [selectedUuid, otherUuids]);
      transaction.addQuery(replacePatientInPatientVisit, [selectedUuid, otherUuids]);

      transaction.addQuery(removeOtherPatients, [otherUuids]);
      transaction.addQuery(removeOtherDebtors, [glb.otherDebtorUuids]);
      return transaction.execute();
    })
    .then(rows => {
      res.sendStatus(204);
    })
    .catch(next)

  res.sendStatus(200);
}
