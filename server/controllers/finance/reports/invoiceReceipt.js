/** 
 * Invoice Receipt Controller
 *
 * This controller is responsible for collecting information required by a 
 * patient invoice receipt. This information is passed to a renderer 
 * according the standard report format and returned to the client (based 
 * on the clients request).
 * 
 * @todo  rename internal lookup method
 *        Invoices.lookupSale -> Invoices... 
 * @todo  get balance information on the invoice
 * @module finance/reports
 */
var uuid        = require('node-uuid');
var q           = require('q');
var _           = require('lodash');

var db          = require('../../../lib/db');
var NotFound    = require('../../../lib/errors/NotFound');
var BadRequest  = require('../../../lib/errors/BadRequest');
  
var Invoices    = require('../patientInvoice');
var Patients    = require('../../medical/patient');
var Enterprises = require('../../admin/enterprises');

const FLAG_TRUE = 1;
const SUCCESS_STATUS = 200;

exports.build = build;
 
/** 
 * HTTP Request Method
 *
 * Returns a compiled object that adheres to the reports standards
 *
 * Request options: 
 * ```
 * {
 *   minimal : {Boolean}  Determine if the report should include header or footer
 *                        information (False)
 *   renderer : {String}  Server core renderer to use; this report supports 
 *                        ['pdf', 'json']
 * }
 * ```
 * 
 * ```
 * { 
 *   header :             Data relevent to the report header, this includes 
 *                        enterprise and recipient data
 *   data   :             Core report data, this includes all relevent invoice data
 *   meta   :             Meta data to do with production of the report
 * }
 */
function build(req, res, next) { 
  var queryString = req.query;
  var invoiceUuid = req.params.uuid;
  var enterpriseId = req.session.enterprise.id;

  var invoiceResponse = {};

  /** @todo Implement minimal flag */
  if (queryString.minimal === FLAG_TRUE) {};   
  
  reportData(invoiceUuid)
    .then(function (result) { 
      var recipientUuid = result.patient_uuid;
      _.extend(invoiceResponse, result);
      
      return headerData(recipientUuid, enterpriseId);
    })
    .then(function (result) { 
      _.extend(invoiceResponse, result);

      res.status(SUCCESS_STATUS).send(invoiceResponse);
    })
    .catch(next)
    .done();
}

// function metaData
function headerData(patientUuid, enterpriseId) { 

  /** @todo write utility method to map keys of request object to returned object */ 
  var headerRequests = { 
    recipient : Patients.lookupPatient(patientUuid), 
    enterprise : Enterprises.lookupEnterprise(enterpriseId)
  };
  
  return q.all(_.values(headerRequests))
    .then(function (results) { 
      var header = {};
       _.keys(headerRequests).forEach((key, index) => header[key] = results[index]);

      return header; 
    });
}

function reportData(uuid) { 
  return Invoices.lookupSale(uuid);
}
