/** 
 * @description Provides API endpoint for requesting information about patient invoices, provides
 * a simplified list of all patient invoices as well as detailed information for a specific invoice
 * GET /sales - retrieve all patient invoices (accepts ?q delimiter) 
 * GET /sales/:uuid - retrieve specific patient invoice 
 * GET /sales/patient/:uuid - retrieve all patient invoices for a specific patient
 * POST /sales - write a new sale 
 *
 * @returns Map exposing all methods used by the /sales API route
 */
var db = require('../../lib/db');

exports.list = list;
exports.details = details;
exports.create = create;

function list(req, res, next) { 
  // Retrieve all patient invoices 
}

function details(req, res, next) { 
  // Retrieve specific patient invoice
}

function create(req, res, next) { 
  // write a new sale
}
