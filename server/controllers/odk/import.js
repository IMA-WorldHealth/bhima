// const moment = require('moment');

// const db = require('../../lib/db');
// const util = require('../../lib/util');
// const Fiscal = require('../finance/fiscal');

const central = require('./central');

exports.loadData = loadData;

// Perfoms actions based on project and form id
async function loadData(req, res, next) {
  const { projectId, formId } = req.params;

  const mapActions = {
    pcima_pv_reception : loadFosaData,
  };

  try {
    const data = await mapActions[formId](projectId, formId, req.session);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

/**
 * Import stock movements from odk
 */
async function loadFosaData(projectId, formId) {
  const submissions = await central.submissions(projectId, formId);
  const collection = submissions.value;

  return collection;
}
