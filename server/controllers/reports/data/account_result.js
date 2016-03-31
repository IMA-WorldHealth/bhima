var q       = require('q');
var db      = require('../../../lib/db');
var numeral = require('numeral');
var formatDollar = '$0,0.00';
var resultAccountDate = new Date();

// expose the http route
exports.compile = function (options) {
  'use strict';  
  var i18nAccountResult = options.language == 'fr' ? require('../lang/fr.json').ACCOUNT_RESULT : require('../lang/en.json').ACCOUNT_RESULT;
  var deferred = q.defer(), context = {}, infos = {}, chargeData = {}, profitData = {};
  var sql =
    'SELECT `acc`.`id` AS `accountId`, `acc`.`label` AS `accounTxt`, `acc`.`number` AS `accountNumber`, ' +
    '`ref`.`id` AS `referenceId`, `ref`.`ref` AS `referenceAbbr`, `ref`.`text` AS `referenceLabel`, ' +
    '`ref`.`position` AS `referencePosition`, `ref`.`is_report` AS `referenceIsReport`, ' +
    '`src`.`id` AS `sectionResultId`, `src`.`text` AS `sectionResultLabel`, `src`.`is_charge` AS `sectionResultIsCharge`, ' +
    '`src`.`position` AS `sectionResultPosition`, SUM(`gld`.`debit_equiv`) AS `generalLegderDebit`, SUM(`gld`.`credit_equiv`) AS `generalLegderCredit` ' +
    'FROM `section_resultat` `src` JOIN `reference` `ref` ON `ref`.`section_resultat_id` = `src`.`id` ' +
    'JOIN `account` `acc` ON `acc`.`reference_id` = `ref`.`id` JOIN `general_ledger` `gld` ON `gld`.`account_id` = `acc`.`id` WHERE `gld`.`trans_date`<= (SELECT MAX(`period_stop`) ' +
    'FROM `period` WHERE `period`.`fiscal_year_id`=?) AND `gld`.`trans_date` >= (SELECT MIN(`period_start`) FROM `period` WHERE `period`.`fiscal_year_id`=?) AND `acc`.`is_ohada`=? ' + 
    'AND `acc`.`type_id` = ? GROUP BY `gld`.`account_id` ORDER BY `src`.`position`, `ref`.`position` ASC;';

  var doBalance = function (somDebit, somCredit, isCharge){
    return (isCharge == 1)? somDebit - somCredit : somCredit - somDebit;
  }
  //populating context object

  context.reportDate = resultAccountDate.toDateString();
  context.options = options;
  context.i18nAccountResult = i18nAccountResult;

  db.exec(sql, [options.fy, options.fy, 1, 1])
  .then(function (currentAccountDetails) {
    infos.currentAccountDetails = currentAccountDetails || [];
    return db.exec(sql, [options.pfy, options.pfy, 1, 1]);
  })
  .then(function (previousAccountDetails){
    infos.previousAccountDetails = previousAccountDetails || [];
    return q.when(infos);
  })
  .then(function (infos){
    //data processing

    var chargeGeneral = 0, chargeGeneralPrevious = 0, profitGeneral = 0, profitGeneralPrevious = 0;

    chargeData.currentAccountDetails = infos.currentAccountDetails.filter(function (item){
      return item.sectionResultIsCharge === 1;
    });

    chargeData.previousAccountDetails = infos.previousAccountDetails.filter(function (item){
      return item.sectionResultIsCharge === 1;
    });

    profitData.currentAccountDetails = infos.currentAccountDetails.filter(function (item){
      return item.sectionResultIsCharge === 0;
    });

    profitData.previousAccountDetails = infos.previousAccountDetails.filter(function (item){
      return item.sectionResultIsCharge === 0;
    });


    context.chargeSide = processCharge(chargeData);
    context.profitSide = processProfit(profitData);


    function processCharge (tbl){
      var currents = tbl.currentAccountDetails;
      var previous = tbl.previousAccountDetails;
      var sections = (currents.length > 0) ? getSections(currents) : [];

      context.chargeGeneral = 0, context.chargeGeneralPrevious = 0;

      sections.forEach(function (section){
        section.total = 0, section.totalPrevious = 0;
        section.refs = getReferences(section, currents);

        section.refs.forEach(function (item){
            item.net = getNet(item, currents, section.sectionResultIsCharge, doBalance);
            item.net_view = numeral(item.net).format(formatDollar);
            section.total += item.net;

            item.previous = getPrevious(item, previous, section.sectionResultIsCharge, doBalance);
            item.previous_view = numeral(item.previous).format(formatDollar);
            section.totalPrevious += item.previous;
        });

        section.total_view = numeral(section.total).format(formatDollar);
        section.totalPrevious_view = numeral(section.totalPrevious).format(formatDollar);

        context.chargeGeneral += section.total;
        context.chargeGeneralPrevious += section.totalPrevious;
      });

      context.chargeGeneral = numeral(context.chargeGeneral).format(formatDollar);
      context.chargeGeneralPrevious = numeral(context.chargeGeneralPrevious).format(formatDollar);
      return sections;
    }

    function processProfit (tbl){
      var currents = tbl.currentAccountDetails;
      var previous = tbl.previousAccountDetails;
      var sections = (currents.length > 0) ? getSections(currents) : [];

      context.profitGeneral = 0, context.profitGeneralPrevious = 0;

      sections.forEach(function (section){
        section.total = 0, section.totalPrevious = 0;
        section.refs = getReferences(section, currents);

        section.refs.forEach(function (item){
            item.net = getNet(item, currents, section.sectionResultIsCharge, doBalance);
            item.net_view = numeral(item.net).format(formatDollar);
            section.total += item.net;

            item.previous = getPrevious(item, previous, section.sectionResultIsCharge, doBalance);
            item.previous_view = numeral(item.previous).format(formatDollar);
            section.totalPrevious += item.previous;
        });

        section.total_view = numeral(section.total).format(formatDollar);
        section.totalPrevious_view = numeral(section.totalPrevious).format(formatDollar);

        context.profitGeneral += section.total;
        context.profitGeneralPrevious += section.totalPrevious;
      });

      context.profitGeneral = numeral(context.profitGeneral).format(formatDollar);
      context.profitGeneralPrevious = numeral(context.profitGeneralPrevious).format(formatDollar);
      return sections;
    }

    function exist (obj, arr, crit){
      return arr.some(function (item){
        return obj[crit] == item[crit];
      });
    }

    function getSections (currents){
      var sections = [];
      sections.push({
        sectionResultId : currents[0].sectionResultId,
        sectionResultPosition : currents[0].sectionResultPosition,
        sectionResultLabel : currents[0].sectionResultLabel,
        sectionResultIsCharge : currents[0].sectionResultIsCharge,
        refs : []
      });

      for(var i = 0; i <= currents.length - 1; i++){
        if(!exist(currents[i], sections, 'sectionResultId')){
          sections.push({
            sectionResultId : currents[i].sectionResultId,
            sectionResultPosition : currents[i].sectionResultPosition,
            sectionResultLabel : currents[i].sectionResultLabel,
            sectionResultIsCharge : currents[i].sectionResultIsCharge,
            refs : []
          })
        }
      }

      return sections;
    }

    function getReferences (section, currents){
      var references = [];

      for(var i = 0; i <= currents.length - 1; i++){
        if(currents[i].sectionResultId == section.sectionResultId){
          if(!exist(currents[i], references, 'referenceId')){
            references.push({
              referenceId : currents[i].referenceId,
              referenceAbbr : currents[i].referenceAbbr,
              referencePosition : currents[i].referencePosition,
              referenceLabel : currents[i].referenceLabel,
              net : 0,
              previousNet : 0
            });
          }
        }
      }
      return references;
    }

    function getNet(reference, currents, isCharge, fn){
      var somDebit = 0, somCredit = 0;

      currents.forEach(function (item){
        if(item.referenceId === reference.referenceId){
          somDebit+=item.generalLegderDebit;
          somCredit+=item.generalLegderCredit;
        }
      });
      return fn(somDebit, somCredit, isCharge);
    }

    function getPrevious (reference, previous, isCharge, fn){
      var somDebit = 0, somCredit = 0;

      previous.forEach(function (item){
        if(item.referenceId === reference.referenceId){
          somDebit+=item.generalLegderDebit;
          somCredit+=item.generalLegderCredit;
        }
      });

      return fn(somDebit, somCredit, isCharge);
    }    

    deferred.resolve(context);
  })
  .catch(deferred.reject)
  .done();

  return deferred.promise;
};
