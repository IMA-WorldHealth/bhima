// reports_proposed/data/bilan.js
// Collects and aggregates data for the enterprise bilan

var q       = require('q');
var db      = require('../../../lib/db');
var numeral = require('numeral');

var formatDollar = '$0,0.00';

// expose the http route
exports.compile = function (options) {
  'use strict';
  var i18nBilan = options.language == 'fr' ? require('../lang/fr.json').BILAN : require('../lang/en.json').BILAN;
  var deferred = q.defer(), context = {}, infos = {}, assetData = {}, passiveData = {};
  var bilanDate = new Date();
  var sql =
    'SELECT `acc`.`id` AS `accountId`, `acc`.`account_txt` AS `accounTxt`, `acc`.`account_number` AS `accountNumber`, ' +
    '`acc`.`is_brut_link` AS `accountIsBrutLink`, `ref`.`id` AS `referenceId`, `ref`.`ref` AS `referenceAbbr`, `ref`.`text` AS `referenceLabel`, ' +
    '`ref`.`position` AS `referencePosition`, `gref`.`id` AS `greferenceId`, `ref`.`is_report` AS `referenceIsReport`, ' +
    '`gref`.`reference_group` AS `greferenceAbbr`, `gref`.`text` AS `greferenceLabel`, `gref`.`position` AS `greferencePosition`, ' +
    '`sbl`.`id` AS `sectionBilanId`, `sbl`.`text` AS `sectionBilanLabel`, `sbl`.`is_actif` AS `sectionBilanIsActif`, ' +
    '`sbl`.`position` AS `sectionBilanPosition`, SUM(`gld`.`debit_equiv`) AS `generalLegderDebit`, SUM(`gld`.`credit_equiv`) AS `generalLegderCredit` ' +
    'FROM `section_bilan` `sbl` JOIN `reference_group` `gref` ON `sbl`.`id` = `gref`.`section_bilan_id` JOIN `reference` `ref` ON `gref`.`id` = `ref`.`reference_group_id` ' +
    'JOIN `account` `acc` ON `acc`.`reference_id` = `ref`.`id` JOIN `general_ledger` `gld` ON `gld`.`account_id` = `acc`.`id` WHERE `gld`.`trans_date`<= (SELECT MAX(`period_stop`) ' +
    'FROM `period` WHERE `period`.`fiscal_year_id`=?) AND `acc`.`is_ohada`=? GROUP BY `gld`.`account_id` ORDER BY `sbl`.`position`, `gref`.`position`, `ref`.`position` DESC;';

  //populating context object
  context.reportDate = bilanDate.toDateString();
  context.options = options;
  context.i18nBilan = i18nBilan;

  db.exec(sql, [options.fy, 1])
  .then(function (ans) {
    infos.current_detail_list = ans;
    return db.exec(sql, [options.pfy, 1]);
  })
  .then(function (ans){
    infos.previous_detail_list = ans;
    return q.when(infos);
  })
  .then(function (infos){
    //data processing

    var AssetGeneralBrut = 0, AssetGeneralAmortProv = 0, AssetGeneralNet = 0, AssetGeneralPreviousNet = 0;

    assetData.current_detail_list = infos.current_detail_list.filter(function (item){
      return item.sectionBilanIsActif === 1;
    });

    assetData.previous_detail_list = infos.previous_detail_list.filter(function (item){
      return item.sectionBilanIsActif === 1;
    });

    passiveData.current_detail_list = infos.current_detail_list.filter(function (item){
      return item.sectionBilanIsActif === 0;
    });

    passiveData.previous_detail_list = infos.previous_detail_list.filter(function (item){
      return item.sectionBilanIsActif === 0;
    });

    context.assetSide = processAsset(assetData);
    context.passiveSide = processPassive(passiveData);

    function processAsset (tbl){
      var currents = tbl.current_detail_list;
      var sections = (currents.length > 0) ? getSections(currents) : [];

      context.assetGeneralBrut = 0, context.assetGeneralAmortProv = 0, context.assetGeneralNet = 0, context.assetGeneralPreviousNet = 0,
      sections.forEach(function (section){
        section.totalBrut = 0, section.totalAmortProv = 0, section.totalNet = 0, section.totalPreviousNet = 0;
        section.grefs = getGroupReferences(section, currents);
        section.grefs.forEach(function (gref){
          gref.refs = getReferences(gref, currents);
          gref.refs.forEach(function (item){

            //brut processing
            item.brut = getBrut(item, currents, section.sectionBilanIsActif);
            item.brut_view = numeral(item.brut).format(formatDollar);
            section.totalBrut += item.brut;

            //amort/prov processing
            var amor = getAmortProv(item, currents, section.sectionBilanIsActif);
            item.amort_prov =  amor < 0 ? amor * -1 : amor;
            item.amort_prov_view = numeral(item.amort_prov).format(formatDollar);
            section.totalAmortProv += item.amort_prov;

            //net processing
            item.net = item.brut - item.amort_prov;
            item.net_view = numeral(item.net).format(formatDollar);
            section.totalNet += item.net;

            //previous net processing
            item.previousNet = getPreviousNet(item, tbl.previous_detail_list, section.sectionBilanIsActif);
            item.previousNet_view = numeral(item.previousNet).format(formatDollar);
            section.totalPreviousNet = item.previousNet;
          });

          //processing total brut, amort, previous net
          section.totalBrut_view = numeral(section.totalBrut).format(formatDollar);
          section.totalAmortProv_view = numeral(section.totalAmortProv).format(formatDollar);
          section.totalNet_view = numeral(section.totalNet).format(formatDollar);
          section.totalPreviousNet_view = numeral(section.totalPreviousNet).format(formatDollar);
        });

        context.assetGeneralBrut += section.totalBrut;
        context.assetGeneralNet += section.totalNet;
        context.assetGeneralAmortProv += section.totalAmortProv;
        context.assetGeneralPreviousNet += section.totalPreviousNet;
      });

      context.assetGeneralBrut = numeral(context.assetGeneralBrut).format(formatDollar);
      context.assetGeneralAmortProv = numeral(context.assetGeneralAmortProv).format(formatDollar);
      context.assetGeneralNet = numeral(context.assetGeneralNet).format(formatDollar);
      context.assetGeneralPreviousNet = numeral(context.assetGeneralPreviousNet).format(formatDollar);
      return sections;
    }

    function processPassive (tbl){
      var currents = tbl.current_detail_list;
      var sections = (currents.length > 0) ? getSections(currents) : [];

      context.passiveGeneralBrut = 0, context.passiveGeneralAmortProv = 0, context.passiveGeneralNet = 0, context.passiveGeneralPreviousNet = 0,
      sections.forEach(function (section){
        section.totalNet = 0, section.totalPreviousNet = 0;
        section.grefs = getGroupReferences(section, currents);
        section.grefs.forEach(function (gref){
          gref.refs = getReferences(gref, currents);
          gref.refs.forEach(function (item){
            var br = getBrut(item, currents, section.sectionBilanIsActif); //tapon pour stocker le brute
            item.net = br < 0 ? br * -1 : br;
            item.net_view = numeral(item.net).format(formatDollar);
            section.totalNet += item.net;

            var prev = getPreviousNet(item, tbl.previous_detail_list, section.sectionBilanIsActif);

            item.previousNet = prev < 0 ? prev * -1 : prev;
            item.previousNet_view = numeral(item.previousNet).format(formatDollar);
            section.totalPreviousNet = item.previousNet;
          });

          section.totalNet_view = numeral(section.totalNet).format(formatDollar);
          section.totalPreviousNet_view = numeral(section.totalPreviousNet).format(formatDollar);
        });

          context.passiveGeneralNet += section.totalNet;
          context.passiveGeneralPreviousNet += section.totalPreviousNet;
      });

      context.passiveGeneralNet = numeral(context.passiveGeneralNet).format(formatDollar);
      context.passiveGeneralPreviousNet = numeral(context.passiveGeneralPreviousNet).format(formatDollar);
      return sections;
    }

    function exist (obj, arr, crit){
      return arr.some(function (item){
        return obj[crit] == item[crit];
      });
    }

    function getSections (list){
      var sections = [];
      sections.push({
        sectionBilanId : list[0].sectionBilanId,
        sectionBilanPosition : list[0].sectionBilanPosition,
        sectionBilanLabel : list[0].sectionBilanLabel,
        sectionBilanIsActif : list[0].sectionBilanIsActif,
        grefs : []
      });

      for(var i = 0; i <= list.length - 1; i++){
        if(!exist(list[i], sections, 'sectionBilanId')){
          sections.push({
            sectionBilanId : list[i].sectionBilanId,
            sectionBilanPosition : list[i].sectionBilanPosition,
            sectionBilanLabel : list[i].sectionBilanLabel,
            sectionBilanIsActif : list[i].sectionBilanIsActif,
            grefs : []
          })
        }
      }

      return sections;
    }

    function getGroupReferences (section, list){
      var greferences = [];

      list.forEach(function (item){
        if(item.sectionBilanId === section.sectionBilanId){
          if(!exist(item, greferences, 'greferenceId')){
            greferences.push({
              greferenceId : item.greferenceId,
              greferenceAbbr : item.greferenceAbbr,
              greferencePosition : item.greferencePosition,
              greferenceLabel : item.greferenceLabel,
              refs : []
            });
          }
        }
      });

      return greferences;
    }

    function getReferences (greference, list){
      var references = [];

      list.forEach(function (item){
        if(item.greferenceId == greference.greferenceId){
          if(!exist(item, references, 'referenceId')){
            references.push({
              referenceId : item.referenceId,
              referenceAbbr : item.referenceAbbr,
              referencePosition : item.referencePosition,
              referenceLabel : item.referenceLabel,
              brut : 0,
              amort_prov : 0,
              net : 0,
              previousNet : 0
            });
          }
        }
      });
      
      return references;
    }

    function getBrut (reference, list, isActif){
      var somDebit = 0, somCredit = 0;

      list.forEach(function (item){
        if(item.referenceId === reference.referenceId && item.accountIsBrutLink === 1){
          somDebit+=item.generalLegderDebit;
          somCredit+=item.generalLegderCredit;
        }
      });


      return (isActif === 1)? somDebit - somCredit : somCredit - somDebit;
    }

    function getAmortProv (reference, currents, isActif){
      var somDebit = 0, somCredit = 0;

      currents.forEach(function (item){
        if(item.referenceId === reference.referenceId && item.accountIsBrutLink === 0){
          somDebit+=(item.generalLegderDebit);
          somCredit+=(item.generalLegderCredit);
        }
      });
      return isActif === 1 ? somDebit - somCredit : somCredit - somDebit;
    }

    function getPreviousNet (reference, previous, isActif){
      var somDebit = 0, somCredit = 0;

      previous.forEach(function (item){
        if(item.referenceId == reference.referenceId && item.accountIsBrutLink == 0){
          somDebit+=(item.generalLegderDebit) * -1;
          somCredit+=(item.generalLegderCredit) * -1;
        }else if(item.referenceId == reference.referenceId && item.accountIsBrutLink == 1){
          somDebit+=item.generalLegderDebit;
          somCredit+=item.generalLegderCredit;
        }
      });
      return isActif == 1 ? somDebit - somCredit : somCredit - somDebit;
    }

    deferred.resolve(context);
  })
  .catch(deferred.reject)
  .done();

  return deferred.promise;
};
