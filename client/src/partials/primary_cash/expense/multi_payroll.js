angular.module('bhima.controllers')
.controller('MultiPayrollController', MultiPayrollController);

MultiPayrollController.$inject = [
  '$scope', '$translate', '$http', '$timeout', 'messenger', 'validate', 'connect',
  'util', 'appcache', 'exchange', '$q', 'ipr', 'uuid', 'SessionService'
];

function MultiPayrollController($scope, $translate, $http, $timeout, messenger, validate, connect, util, Appcache, exchange, $q, ipr, uuid, SessionService) {
  var dependencies = {},
      cache = new Appcache('payroll'),
      session = $scope.session = {configured : false, complete : false, data : {}, selectedCurrency : {}, rows : [], error: {} };

  dependencies.currencies = {
    required : true,
    query : {
      tables : {
        'currency' : {
          columns : ['id', 'symbol', 'min_monentary_unit']
        }
      }
    }
  };

  dependencies.exchange_rate = {
    required : true,
    query : {
      tables : {
        'exchange_rate' : {
          columns : ['id', 'enterprise_id', 'currency_id', 'date', 'rate']
        }
      },
      where : ['exchange_rate.date=' + util.sqlDate(new Date())]
    }
  };

  dependencies.employees = {
    query : {
      tables : {
        employee : {
          columns : [
            'id', 'code::code_employee', 'prenom', 'name', 'postnom', 'sexe', 'dob',
            'date_embauche', 'service_id', 'nb_spouse', 'nb_enfant', 'grade_id', 'locked',
            'daily_salary', 'phone', 'email', 'adresse', 'bank', 'bank_account', 'location_id'
          ]
        },
        grade : { columns : ['text', 'basic_salary', 'code::code_grade']},
        fonction : { columns : ['id::fonction_id', 'fonction_txt']},
        debitor : { columns : ['uuid::debitor_uuid', 'text::debitor_text', 'group_uuid::debitor_group_uuid']},
        creditor : { columns : ['uuid::creditor_uuid', 'text::creditor_text', 'group_uuid::creditor_group_uuid']}
      },
      join : ['employee.grade_id=grade.uuid',
        'employee.fonction_id=fonction.id',
        'employee.debitor_uuid=debitor.uuid',
        'employee.creditor_uuid=creditor.uuid'
      ],
      where : ['employee.locked<>1'],
      orderby: ['employee.name','employee.postnom']
    }
  };

  dependencies.paiement_period = {
    query : {
      tables : {
        'paiement_period' : {
          columns : ['id', 'config_tax_id', 'config_rubric_id', 'config_cotisation_id', 'config_accounting_id', 'label', 'dateFrom', 'dateTo']
        }
      }
    }
  };

  dependencies.enterprise = {
    query : {
      tables : {
        'enterprise' : {
        columns : ['currency_id']
      }
      }
    }
  };

  dependencies.paiements = {
    query : {
      tables : {
        'paiement' : {
          columns : ['uuid', 'employee_id']
        }
      }
    }
  };

  start();

  function start() {
    $scope.project = SessionService.project;
    validate.process(dependencies, ['paiement_period', 'exchange_rate', 'currencies'])
    .then(init, function (err) {
      session.error.paiement_period = err.reference === 'paiement_period' ? true : false;
      session.error.exchange_rate = err.reference === 'exchange_rate' ? true : false;
      return;
    });
  }

  function reconfigure() {
    cache.remove('paiement_period');
    session.pp = null;
    session.configured = false;
    session.complete = false;
  }

  function init (model) {
    session.model = model;
    model.enterprise = SessionService.enterprise;
    initCurrency();
    if (session.pp) {

      // Process only when we have session.pp
      initPaiementPeriod()
      .then(initConfiguration)
      .then(getOffDayCount)
      .then(getTrancheIPR)
      .then(initTranche)
      .then(getEmployees)
      .catch(initError)
      .finally(endLoading);
    }

    function initCurrency(enterprise_id) {
      if (!session.currency) {
        session.configured = false;
        session.complete = false;
      }
      session.loading_currency_id = (session.currency) ? session.currency.id : enterprise_id;
      session.selectedCurrency = (session.currency) ? session.currency : null;
    }

    function initPaiementPeriod() {
      session.state = 'loading';
      dependencies.paiements.query.where = ['paiement.paiement_period_id=' + session.pp.id];
      if (dependencies.paiements) {
        dependencies.paiements.processed = false;
      }
      if (dependencies.employees) {
        dependencies.employees.processed = false;
      }
      return validate.process(dependencies, ['employees', 'paiements']);
    }

    function initConfiguration(model) {
      session.model = model;
      session.configured = true;
      session.complete = true;
      return fetchConfigurations();
    }

    function initTranche(tranches) {
      session.tranches_ipr = tranches;
      return $q.when();
    }

    function initError(err) {
      if (err !== 'currency_required' && err !== 'pp_required') {
        messenger.danger(err.message);
      }
      return;
    }
  }

  function endLoading() {
    $timeout(function () {
      session.state = 'completed';
    }, 0);
  }

  function getEmployees () {
    var def = $q.defer();
    session.rows = [];
    var unpaidEmployees = getUnpaidEmployees();
    unpaidEmployees.forEach(function (emp) {
      new EmployeeRow(emp)
      .then(function (row) {
        session.rows.push(row);
        def.resolve(session.rows);
      });
    });

    return def.promise;
  }

  function getUnpaidEmployees () {
    return session.model.employees.data.filter(function (emp) {
      var pass = session.model.paiements.data.some(function (paiement) {
        return paiement.employee_id === emp.id;
      });
      return !pass;
    });
  }

  function refreshList () {
    return session.rows.filter(function (row) {
      var pass = session.model.paiements.data.some(function (paiement) {
        return paiement.employee_id === row.emp.id;
      });
      return !pass;
    });
  }

  function EmployeeRow (emp) {
    //FIX ME : clean this function
    var def = $q.defer();
    var self = this;
    self.emp = emp;

    getHollyDayCount(emp)
    .then(function (hld) {
      var hl = (hld)? hld.nb : 0; //hl contains the number of hollydays
      self.datahl = (hld)? hld.data : null;

      self.coefhl = (hld)? hld.coeff : 0;
      self.off_day = session.data.off_day;

      self.emp.basic_salary =
      exchange.convertir(
        self.emp.basic_salary,
        session.model.enterprise.currency_id,
        session.selectedCurrency.id,
        util.sqlDate(new Date())
      );
      self.max_day = session.data.max_day;
      self.working_day = session.data.max_day - (hl + session.data.off_day);
      self.hollydays = hl;
      self.offdays = session.data.off_day;

      self.daily_salary = self.emp.basic_salary / session.data.max_day;
      self.visible = false;

      var taxes = session.model.tax_config.data;
      var cotisations = session.model.cotisation_config.data;

      var taxEmp = taxes.filter(function (item) {
        return item.is_employee  === 1;
      });

      var taxComp = taxes.filter(function (item) {
        return item.is_employee  === 0;
      });

      if (taxEmp) {
        $scope.taxEmp = taxEmp;
      }

      if (taxComp) {
        $scope.taxComp = taxComp;
      }

      var cotisationEmp = cotisations.filter(function (item) {
        return item.is_employee  === 1;
      });

      var cotisationComp = cotisations.filter(function (item) {
        return item.is_employee  === 0;
      });

      if (cotisationEmp) {
        $scope.cotisationEmp = cotisationEmp;
      }

      if (cotisationComp) {
        $scope.cotisationComp = cotisationComp;
      }

      var rubrics = session.model.rubric_config.data;

      rubrics.forEach(function (rub) {
        var dataRubric = (rub.is_percent) ?
        ((self.daily_salary * (self.working_day + self.coefhl + self.offdays)) * rub.value) / 100 : rub.value;
        self[rub.abbr] = dataRubric;
      });

      taxes.forEach(function (tax) {
        var dataTax = (tax.is_percent) ?
        ((self.daily_salary * (self.working_day + self.coefhl + self.offdays)) * tax.value) / 100 : tax.value;
        self[tax.abbr] = dataTax;
      });

      var employee_cotisation = 0;

      cotisations.forEach(function (cotisation) {
        var dataCotisations = (cotisation.is_percent) ?
      ((self.daily_salary * (self.working_day + self.coefhl + self.offdays)) * cotisation.value) / 100 : cotisation.value;
        self[cotisation.abbr] = dataCotisations;
        if (cotisation.is_employee) {employee_cotisation += dataCotisations;}
      });

      self.net_before_taxe = (self.working_day + self.coefhl + self.offdays) * self.daily_salary;
      return getIPR(self);
    })
    .then(function (IPR) {
      var taxes = session.model.tax_config.data;
      self.IPR1 = IPR;
      taxes.forEach(function (tax) {
        if (tax.is_ipr) {
          self[tax.abbr] = IPR;
        }
      });
      self.offdays_cost = getOffDayCost(self);
      def.resolve(self);
    });
    return def.promise;
  }

  function getIPR(row) {
    var tranches = session.tranches_ipr;
    if (!tranches.length) {return 0;}

    var net_imposable = exchange.convertir(
      row.net_before_taxe,
      session.selectedCurrency.id,
      tranches[0].currency_id,
      util.sqlDate(new Date())
    );
    var montant_annuel = net_imposable * 12;
    var ind = -1;
    for(var i = 0; i< tranches.length; i++) {
      if (montant_annuel > tranches[i].tranche_annuelle_debut && montant_annuel < tranches[i].tranche_annuelle_fin) {
        ind = i;
        break;
      }
    }

    if (ind < 0) { return 0; }

    var initial = tranches[ind].tranche_annuelle_debut;
    var taux = tranches[ind].taux / 100;

    var cumul = (tranches[ind - 1]) ? tranches[ind - 1].cumul_annuel : 0;
    var value = (((montant_annuel - initial) * taux) + cumul) / 12;
    if (row.emp.nb_enfant > 0) {
      value -= (value * (row.emp.nb_enfant * 2)) / 100;
    }
    return exchange.convertir(value, tranches[0].currency_id, session.selectedCurrency.id, util.sqlDate(new Date()));
  }

  function getOffDayCost (row) {
    var cost = 0;
    session.model.offDays.data.forEach(function (offday) {
      cost = cost + (row.daily_salary * offday.percent_pay) / 100;
    });
    return cost;
  }

  function fetchConfigurations() {

    dependencies.paiement_period_conf = {
      required : true,
      query : {
        tables : {
          'config_paiement_period' : {
            columns : ['id', 'weekFrom', 'weekTo']
          }
        },
        where : ['config_paiement_period.paiement_period_id=' + session.pp.id]
      }
    };

    dependencies.rubric_config = {
      query : {
        tables : {
          'config_rubric' : {
            columns : ['label']
          },
          'config_rubric_item' : {
            columns : ['rubric_id', 'payable']
          },
          'rubric' : {
            columns : ['id', 'abbr', 'label', 'is_advance', 'is_percent', 'is_discount', 'is_social_care', 'value']
          }
        },
        join : [
          'config_rubric.id=config_rubric_item.config_rubric_id',
          'rubric.id=config_rubric_item.rubric_id'
        ],
        where : [
          'config_rubric.id=' + session.pp.config_rubric_id
        ]
      }
    };

    dependencies.tax_config = {
      query : {
        tables : {
          'config_tax' : {
            columns : ['label']
          },
          'config_tax_item' : {
            columns : ['tax_id', 'payable']
          },
          'tax' : {
            columns : ['id', 'abbr','label', 'is_percent', 'is_ipr', 'value', 'four_account_id', 'six_account_id', 'is_employee']
          }
        },
        join : [
          'config_tax.id=config_tax_item.config_tax_id',
          'tax.id=config_tax_item.tax_id'
        ],
        where : [
          'config_tax.id=' + session.pp.config_tax_id
        ]
      }
    };

    dependencies.cotisation_config = {
      query : {
        tables : {
          'config_cotisation' : {
            columns : ['label']
          },
          'config_cotisation_item' : {
            columns : ['cotisation_id', 'payable']
          },
          'cotisation' : {
            columns : ['id', 'abbr','label', 'is_percent', 'value', 'four_account_id', 'six_account_id', 'is_employee']
          }
        },
        join : [
          'config_cotisation.id=config_cotisation_item.config_cotisation_id',
          'cotisation.id=config_cotisation_item.cotisation_id'
        ],
        where : [
          'config_cotisation.id=' + session.pp.config_cotisation_id
        ]
      }
    };

    return validate.process(dependencies, ['paiement_period_conf', 'rubric_config', 'tax_config', 'cotisation_config']);
  }

  function getOffDayCount (model) {
    session.model = model;

    dependencies.offDays = {
      query : {
        tables : {
          'offday' : {
            columns : ['id', 'label', 'date', 'percent_pay']
          }
        },
        where : ['offday.date>=' + util.sqlDate(session.pp.dateFrom), 'AND', 'offday.date<=' + util.sqlDate(session.pp.dateTo)]
      }
    };
    validate.process(dependencies, ['offDays'])
    .then(function (model) {
      var offdays = model.offDays.data;
      var pp_confs = model.paiement_period_conf.data;
      var nb_offdays = 0;
      session.data.max_day = getMaxDays(pp_confs);
      offdays.forEach(function (offDay) {
        for(var i = 0; i < pp_confs.length; i++) {
          if ((util.isDateAfter(offDay.date, pp_confs[i].weekFrom) || util.areDatesEqual(offDay.date, pp_confs[i].weekFrom)) &&
              (util.isDateAfter(pp_confs[i].weekTo, offDay.date) || util.areDatesEqual(offDay.date, pp_confs[i].weekTo))) {
            nb_offdays++;
          }
        }
      });
      session.data.offdays = offdays;
      session.data.off_day = nb_offdays;
    });
    return $q.when();
  }

  function getTrancheIPR () {
    return ipr.calculate();
  }

  function getMaxDays (ppcs) {
    var nb = 0;
    ppcs.forEach(function (item) {
      var t2 = new Date(item.weekTo).getTime();
      var t1 = new Date(item.weekFrom).getTime();
      nb += (parseInt((t2-t1)/(24*3600*1000))) + 1;
    });
    return nb;
  }

  function getHollyDayCount (employee) {
    var defer = $q.defer();
    var som = 0;
    var pp = session.pp;

    connect.fetch('/hollyday_list/' + JSON.stringify(pp) + '/' + employee.id)
    .then(function (res) {
      var hollydays = res;
      if (hollydays.length) {
        var pp_confs = session.model.paiement_period_conf.data,
          soms = [],
          configs = [],
          dataHollydays = [];

        hollydays.forEach(function (h) {
          var nb = 0, nbOf = 0;

          function getValue (ppc) {
            var date_pweekfrom = new Date(ppc.weekFrom);
            var date_pweekto = new Date(ppc.weekTo);

            var date_hdatefrom = new Date(h.dateFrom);
            var date_hdateto = new Date(h.dateTo);
            var nbOff = 0;

            var num_pweekfrom = date_pweekfrom.setHours(0,0,0,0);
            var num_pweekto = date_pweekto.setHours(0,0,0,0);

            var num_hdatefrom = date_hdatefrom.setHours(0,0,0,0);
            var num_hdateto = date_hdateto.setHours(0,0,0,0);

            var minus_right = 0, minus_left = 0;

            if (num_pweekto > num_hdateto) {
              minus_right = parseInt((num_pweekto - num_hdateto) / (24*3600*1000));
            }

            if (num_pweekfrom < num_hdatefrom) {
              minus_left = parseInt((num_hdatefrom - num_pweekfrom) / (24*3600*1000));
            }
            var nbOffDaysPos = 0; //contains offdays number included in holliday period

            for(var i = 0; i < session.data.offdays.length; i++) {
              var dateOff = new Date(session.data.offdays[i].date);
              var num_dateOff = dateOff.setHours(0,0,0,0);
              if (((num_dateOff >= num_hdatefrom) && (num_dateOff <= num_hdateto)) &&
                ((num_dateOff >= num_pweekfrom) && (num_dateOff <= num_pweekto))) {
                nbOffDaysPos++;
              }
            }
            var t2 = date_pweekto.getTime();
            var t1 = date_pweekfrom.getTime();
            var total = (parseInt((t2-t1)/(24*3600*1000))) + 1 - nbOffDaysPos;
            if (minus_left > total) { return 0; }
            if (minus_right > total) { return 0; }
            return total - (minus_left + minus_right);
          }

          pp_confs.forEach(function (ppc) {
            nb += getValue(ppc);
          });
          soms.push(nb);

          dataHollydays.push({
            'id_hdays' : h.id,
            'nbdays' : nb,
            'percentage' : h.percentage
          });

          var valeur = nb * (h.percentage / 100);
          configs.push(valeur);
        });

        // TODO
        //  This anonymous function is used twice!
        //  Using the DRY principle, we can reduce this
        //  to one function!
        som = soms.reduce(function (x, y) {
          return x+y;
        }, 0);

        var somConfig = configs.reduce(function (x, y) {
          return x+y;
        }, 0);

        defer.resolve({nb : som, coeff : somConfig, data : dataHollydays});
      } else {
        defer.resolve(0);
      }
    });
    return defer.promise;
  }

  function getRubricPayroll (row) {
    var rubrics = session.model.rubric_config.data, housing = 0;
    rubrics.forEach(function (rub) {
      var dataRubric = (rub.is_percent) ?
        ((row.daily_salary * (row.working_day + row.hollydays + row.offdays)) * rub.value) / 100 : rub.value;
      row[rub.abbr] = dataRubric;
    });
  }

  function setCurrency(currency) {
    if (currency) {
      session.loading_currency_id = session.selectedCurrency ? session.selectedCurrency.id : session.model.enterprise.currency_id;
      var reload = session.selectedCurrency ? false : true;
      session.selectedCurrency = currency;
      cache.put('selectedCurrency', currency);
      if (reload) {
        init(session.model);
      }
    }
  }

  function formatPeriod (pp) {
    return [pp.label, util.sqlDate(pp.dateFrom), util.sqlDate(pp.dateTo)].join(' / ');
  }

  function setConfiguration (pp) {
    if (pp) {
      cache.put('paiement_period', pp);
      session.configured = true;
      session.pp = pp;
      session.complete = true;
      init(session.model);
    }
  }

  function payEmployee(packagePay) {

    var params = {
      paiement_uuid : packagePay.paiement.uuid,
      project_id : $scope.project.id
    };

    return connect.post('paiement', [packagePay.paiement])
      .then(function () {
        return (packagePay.rc_records.length > 0) ? connect.post('rubric_paiement', packagePay.rc_records) : $q.when();
      })
      .then(function () {
        return (packagePay.tc_records.length > 0) ? connect.post('tax_paiement', packagePay.tc_records) : $q.when();
      })
      .then(function () {
        return (packagePay.cc_records.length > 0) ? connect.post('cotisation_paiement', packagePay.cc_records) : $q.when();
      })
      .then(function () {
        return (packagePay.hollydaysData.length > 0) ? connect.post('hollyday_paiement', packagePay.hollydaysData) : $q.when();
      })
      .then(function () {
        return $http.post('/posting_promesse_payment/', params);
      })
      .then(function () {
        return (packagePay.cc_records.length > 0) ? $http.post('/posting_promesse_cotisation/', params) : $q.when();
      })
      .then(function () {
        return (packagePay.tc_records.length > 0) ? $http.post('/posting_promesse_tax/', params) : $q.when();
      });
  }

  function submit (list) {

    var rubric_config_list = session.model.rubric_config.data;
    var tax_config_list = session.model.tax_config.data;
    var cotisation_config_list = session.model.cotisation_config.data;

    return $q.all(list.map(function (elmt) {
      var rc_records = [];
      var tc_records = [];
      var cc_records = [];
      var hollydaysData = [];

      var somRub = 0, SomTax = 0, somCot = 0, somPrime = 0;

      rubric_config_list.forEach(function (rub) {
        var change = elmt[rub.abbr];
        if (!rub.is_social_care) {
          somPrime += elmt[rub.abbr];
        }
      });

      cotisation_config_list.forEach(function (cotisation) {
        // FIXME: it's necessary to keep catisation value unmodifiable
        // the code below it commented because we offer to user the possibility
        // to change manually cotisation value...
        // FIXME: we need a function which update the cotisation value
        // if (cotisation.is_percent) {
        //   var primePercentCotisation = ((somPrime * cotisation.value) / 100);
        //   elmt[cotisation.abbr] += primePercentCotisation;
        // }

        if (cotisation.is_employee) {
          somCot += elmt[cotisation.abbr];
        }
      });

      elmt.net_before_taxe += somPrime;
      // FIXME: IPR value must be modifiable in a input zone
      // var newIPR = getIPR(elmt);

      tax_config_list.forEach(function (tax) {
        // FIXME: Dont reset the IPR value after a user change
        // if (tax.is_ipr) {
        //   elmt[tax.abbr] = newIPR;
        // }
        if (tax.is_employee) {
          SomTax += elmt[tax.abbr];
        }
      });

      rubric_config_list.forEach(function (rub) {
        var change = elmt[rub.abbr];
        if (rub.is_discount) {
          change *= -1;
        }

        if (rub.is_social_care) {
          somRub += change;
        }
      });

      elmt.gross_salary = elmt.net_before_taxe + somRub;
      elmt.net_after_taxe = elmt.net_before_taxe - somCot - SomTax;

      elmt.net_salary = elmt.net_after_taxe + somRub - (elmt.daily_salary * elmt.off_day) + elmt.offdays_cost;

      var paiement = {
        uuid : uuid(),
        employee_id : elmt.emp.id,
        paiement_period_id : session.pp.id,
        currency_id : session.selectedCurrency.id,
        paiement_date : util.sqlDate(new Date()),
        working_day : elmt.working_day,
        net_before_tax : elmt.net_before_taxe,
        net_after_tax : elmt.net_after_taxe,
        net_salary : elmt.net_salary
      };

      rubric_config_list.forEach(function (rc) {
        var record = {
          paiement_uuid : paiement.uuid,
          rubric_id : rc.id,
          value : elmt[rc.abbr]
        };
        rc_records.push(record);
      });

      tax_config_list.forEach(function (tc) {
        var record = {
          paiement_uuid : paiement.uuid,
          tax_id : tc.id,
          value : elmt[tc.abbr],
          posted : 0
        };
        tc_records.push(record);
      });

      cotisation_config_list.forEach(function (cc) {
        var record = {
          paiement_uuid : paiement.uuid,
          cotisation_id : cc.id,
          value : elmt[cc.abbr],
          posted : 0
        };
        cc_records.push(record);
      });

      if (elmt.datahl) {
        hollydaysData =  elmt.datahl.map(function (item) {
          return {
            hollyday_id : item.id_hdays,
            hollyday_nbdays : item.nbdays,
            hollyday_percentage : item.percentage,
            paiement_uuid : paiement.uuid
          };
        });
      }

      var packagePay = {
        paiement : paiement,
        rc_records : rc_records,
        tc_records : tc_records,
        cc_records : cc_records,
        hollydaysData : hollydaysData
      };

      return payEmployee(packagePay);
    }))
    .then(function (tab) {
      messenger.success($translate.instant('PRIMARY_CASH.EXPENSE.SUCCESS'));
      validate.refresh(dependencies, ['paiements'])
      .then(function () {
        session.rows = refreshList();
      });
    })
    .catch(function (err) {
      messenger.danger(err);
    });
  }

  function refresh(row) {
    if (!row.working_day) {
      row.working_day = 0;
    }

    var totaldays = row.working_day + row.hollydays + row.offdays;


    var taxes, rubrics, cotisations;
    var employee_cotisation;

    if (totaldays <= row.max_day) {
      taxes = session.model.tax_config.data;
      rubrics = session.model.rubric_config.data;
      cotisations = session.model.cotisation_config.data;

      rubrics.forEach(function (rub) {
        if (rub.is_percent) {
          row[rub.abbr] = (((row.daily_salary * (row.working_day + row.coefhl + row.offdays)) * rub.value) / 100);
        }
      });

      taxes.forEach(function (tax) {
        if (tax.is_percent) {
          row[tax.abbr] = (((row.daily_salary * (row.working_day + row.coefhl + row.offdays)) * tax.value) / 100);
        }
      });

      employee_cotisation = 0;

      cotisations.forEach(function (cotisation) {
        if (cotisation.is_percent) {
          row[cotisation.abbr] = (((row.daily_salary * (row.working_day + row.coefhl + row.offdays)) * cotisation.value) / 100);
        }

      });

      row.net_before_taxe = ((row.working_day + row.coefhl + row.offdays) * row.daily_salary);

      row.IPR1 = getIPR(row);

    } else if (totaldays > row.max_day) {
      messenger.danger($translate.instant('RUBRIC_PAYROLL.NOT_SUP_MAXDAY'));
      //repeating twice tax, rubric and cotisation processing, we can use a dedicated function for that
      row.working_day = 0;
      taxes = session.model.tax_config.data;
      rubrics = session.model.rubric_config.data;
      cotisations = session.model.cotisation_config.data;

      rubrics.forEach(function (rub) {
        if (rub.is_percent) {
          row[rub.abbr] = (((row.daily_salary * (row.working_day + row.coefhl + row.offdays)) * rub.value) / 100);
        }
      });

      taxes.forEach(function (tax) {
        if (tax.is_percent) {
          row[tax.abbr] = (((row.daily_salary * (row.working_day + row.coefhl + row.offdays)) * tax.value) / 100);
        }

      });

      employee_cotisation = 0;

      cotisations.forEach(function (cotisation) {
        if (cotisation.is_percent) {
          row[cotisation.abbr] = (((row.daily_salary * (row.working_day + row.coefhl + row.offdays)) * cotisation.value) / 100);
        }
      });

      row.net_before_taxe = ((row.working_day + row.coefhl + row.offdays) * row.daily_salary);
    }
  }

  $scope.$watch('session.selectedCurrency', function (nval, oval) {

     if (session.rows.length) {
        session.rows.forEach(function (row) {
          row.emp.basic_salary =
            exchange.convertir(
              row.emp.basic_salary,
              session.loading_currency_id,
              session.selectedCurrency.id,
              util.sqlDate(new Date())
          );

          row.daily_salary =
            exchange.convertir(
              row.daily_salary,
              session.loading_currency_id,
              session.selectedCurrency.id,
              util.sqlDate(new Date())
          );

          var taxes = session.model.tax_config.data;
          var rubrics = session.model.rubric_config.data;
          var cotisations = session.model.cotisation_config.data;

          rubrics.forEach(function (rub) {
            row[rub.abbr] = exchange.convertir(
              row[rub.abbr],
              session.loading_currency_id,
              session.selectedCurrency.id,
              util.sqlDate(new Date())
            );
          });

          taxes.forEach(function (tax) {
            row[tax.abbr] = exchange.convertir(
              row[tax.abbr],
              session.loading_currency_id,
              session.selectedCurrency.id,
              util.sqlDate(new Date())
            );
          });

          cotisations.forEach(function (cotisation) {
            row[cotisation.abbr] = exchange.convertir(
              row[cotisation.abbr],
              session.loading_currency_id,
              session.selectedCurrency.id,
              util.sqlDate(new Date())
            );
          });
          row.net_before_taxe =
            exchange.convertir(
              row.net_before_taxe,
              session.loading_currency_id,
              session.selectedCurrency.id,
              util.sqlDate(new Date())
          );

          row.net_after_taxe =
            exchange.convertir(
              row.net_after_taxe,
              session.loading_currency_id,
              session.selectedCurrency.id,
              util.sqlDate(new Date())
          );

          row.offdays_cost =
            exchange.convertir(
              row.offdays_cost,
              session.loading_currency_id,
              session.selectedCurrency.id,
              util.sqlDate(new Date())
          );

          row.net_salary =
            exchange.convertir(
              row.net_salary,
              session.loading_currency_id,
              session.selectedCurrency.id,
              util.sqlDate(new Date())
          );
        });
      }
  }, true);

  $scope.setCurrency = setCurrency;
  $scope.formatPeriod = formatPeriod;
  $scope.setConfiguration = setConfiguration;
  $scope.reconfigure = reconfigure;
  $scope.submit = submit;
  $scope.refresh = refresh;
}
