/**
 * this file allow to calculate indicators
 */
const _ = require('lodash');
const collect = require('./collect');

exports.processIndicators = processIndicators;
exports.processDetailsIndicators = processDetailsIndicators;

/**
 * @function processIndicators
 * @description this function helps to calculate all indicators
 * @param {object} options - may contain date_start, date_end, service_id
 * @returns {array}
 */
async function processIndicators(options) {
  const dependencies = {};
  const indicators = {};

  try {

    // hospitalization indicators
    const hospitalizationCollection = await collect.hospitalization(options);
    const staffCollection = await collect.staff(options);
    const financeCollection = await collect.finances(options);

    dependencies.hospitalization = getIndicatorsVariables(hospitalizationCollection);
    dependencies.staff = getIndicatorsVariables(staffCollection);
    dependencies.finance = getIndicatorsVariables(financeCollection);

    /**
     * for the given period range, calculate inducators
     * dependencies are objects with keys as period
     * dependencies :
     * { '2019-02-01':
     *   { total_day_realized: 30,
     *     total_hospitalized_patient: 30,
     *     total_death: 30,
     *     period_start: '2019-02-01',
     *     service_name: 'Administration',
     *     total_beds: 20
     *    }
     * }
     */
    _.keys(dependencies.hospitalization).forEach(period => {
      const periodicDependencies = dependencies.hospitalization[period];
      indicators.hospitalization = getHospitalizationIndicators(
        periodicDependencies, hospitalizationCollection.totalDaysOfPeriods.nb_days
      );
    });

    return indicators;
  } catch (error) {
    throw error;
  }
}

/**
 * processDetailsIndicators
 */
function processDetailsIndicators() {
}

/**
 * @param {object} collection
 * an object returned by collect.fn which must be { summaryIndicators: ..., lastValueIndicators: ... }
 */
function getIndicatorsVariables(collection) {
  const periodicIndicatorsVariables = {};
  const { summaryIndicators, lastValueIndicators } = collection;

  const groupOfSummaryByPeriodStartDate = _.groupBy(summaryIndicators, 'period_start');
  const groupOfLastValueByPeriodStartDate = _.groupBy(lastValueIndicators, 'period_start');

  // merge summary and last by periods
  const groupOfSummaryByPeriodStartDateKeys = _.keys(groupOfSummaryByPeriodStartDate);
  const groupOfLastValueByPeriodStartDateKeys = _.keys(groupOfLastValueByPeriodStartDate);

  for (let i = 0; i < groupOfSummaryByPeriodStartDateKeys.length; i++) {
    const periodLabel = groupOfSummaryByPeriodStartDateKeys[i];
    periodicIndicatorsVariables[periodLabel] = {};

    for (let j = 0; j < groupOfLastValueByPeriodStartDateKeys.length; j++) {
      const periodLastValueLabel = groupOfLastValueByPeriodStartDateKeys[j];

      if (periodLabel === periodLastValueLabel) {
        // merge summary properties with last values properties
        periodicIndicatorsVariables[periodLabel] = _.extend(
          periodicIndicatorsVariables[periodLabel],
          groupOfSummaryByPeriodStartDate[periodLabel][0],
          groupOfLastValueByPeriodStartDate[periodLabel][0]
        );
      }
    }
  }

  return periodicIndicatorsVariables;
}

/**
 * hospitalization indicators
 * @param {object} - dependencies
 * An object which contains indicators variables, returned by the getIndicatorsVariables function
 */
function getHospitalizationIndicators(dependencies, totalDaysOfPeriods = 356) {
  const bedOccupationRate = dependencies.total_day_realized
    / (totalDaysOfPeriods || 1)
    / (dependencies.total_beds || 1);

  const averageHospitalizationDays = dependencies.total_day_realized / dependencies.total_hospitalized_patient;

  const dailyHospitalization = dependencies.total_hospitalized_patient / totalDaysOfPeriods;

  const deathRate = (dependencies.total_death / dependencies.total_hospitalized_patient) * 100;

  // format the result for having indicators and dependencies
  const indicators = {
    bedOccupationRate : {
      value : bedOccupationRate,
      dependencies : [
        { key : 'HOSP_DAYS', value : dependencies.total_day_realized },
        { key : 'NB_DAYS', value : totalDaysOfPeriods },
        { key : 'TOTAL_BED', value : dependencies.total_beds },
      ],
    },

    averageHospitalizationDays : {
      value : averageHospitalizationDays,
      dependencies : [
        { key : 'HOSP_DAYS', value : dependencies.total_day_realized },
        { key : 'TOTAL_HOSPI_PATIENT', value : dependencies.total_hospitalized_patient },
      ],
    },

    dailyHospitalization : {
      value : dailyHospitalization,
      dependencies : [
        { key : 'TOTAL_HOSPI_PATIENT', value : dependencies.total_hospitalized_patient },
        { key : 'NB_DAYS', value : totalDaysOfPeriods },
      ],
    },

    deathRate : {
      value : deathRate,
      dependencies : [
        { key : 'TOTAL_DEATH', value : dependencies.total_death },
        { key : 'TOTAL_HOSPI_PATIENT', value : dependencies.total_hospitalized_patient },
      ],
    },
  };

  return indicators;
}
