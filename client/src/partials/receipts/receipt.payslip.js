angular.module('bhima.controllers')
.controller('receipt.payslip', [
  '$scope',
  '$q',
  '$http',
  'validate',
  'appstate',
  'util',
  'messenger',
  function ($scope, $q, $http, validate, appstate, util, messenger) {
    var dependencies = {}, model = $scope.model = {common : {}};

    function processPayslip (invoiceId) {
      $scope.TotalPaid = 0;
      $scope.TotalWithheld = 0;
      $scope.TotalNet = 0;

      $http.get('/getDataPaiement/',{params : {
            'invoiceId' : invoiceId
          }
      }).
      success(function(data) {
        getPPConf();
        function getHollyDayCount(paiement_period_confs) {
          dependencies.get_holidayCount = {
            query : {
              tables : {
                'holiday_paiement' : {
                  columns : ['holiday_id', 'holiday_nbdays', 'holiday_percentage', 'paiement_uuid']
                },
                'holiday' : {
                  columns : ['id', 'label']
                }
              },
              join : [
                'holiday.id=holiday_paiement.holiday_id'
              ],
              where : [
                'holiday_paiement.paiement_uuid=' + invoiceId
              ]
            }
          };
          validate.process(dependencies, ['get_holidayCount'])
          .then(function (model) {
            if(data[0].enterprise_currency_id !== data[0].currency_id){
              data[0].basic_salary *= data[0].rate;
            }

            $scope.total_day = data[0].working_day;
            $scope.daly_rate = data[0].basic_salary / $scope.max_day;

            $scope.amont_payable = $scope.daly_rate * $scope.total_day;
            $scope.TotalPaid += $scope.amont_payable;
            $scope.TotalNet += $scope.amont_payable;

            var dataHollydays = $scope.dataHollydays = model.get_holidayCount.data,
              cotisationValue = model.get_cotisation.data,
              dailyRate = data[0].basic_salary / $scope.max_day;

            dataHollydays.forEach(function (item) {
            item.dailyHollyd = dailyRate * (item.holiday_percentage /100);
            item.somHolly = item.dailyHollyd * item.holiday_nbdays;

            $scope.TotalPaid += item.somHolly;
            $scope.TotalNet += item.somHolly;
          });
        });
      }
      function getOffDayCount() {
        dependencies.offDays = {
          query : {
            tables : {
              'offday' : {
                columns : ['id', 'label', 'date', 'percent_pay']
              }
            },
            where : ['offday.date>=' + util.sqlDate(data[0].dateFrom), 'AND', 'offday.date<=' + util.sqlDate(data[0].dateTo)]
          }
        };

        validate.process(dependencies, ['offDays'])
        .then(function (model) {
          $scope.nbOffDays = model.offDays.data.length;
          $scope.OffDaysData = model.offDays.data;
        });
      }

      function getOffDay() {
        dependencies.offDays = {
          query : {
            tables : {
              'offday' : {
                columns : ['id', 'label', 'date', 'percent_pay']
              }
            },
            where : ['offday.date>=' + util.sqlDate(data[0].dateFrom), 'AND', 'offday.date<=' + util.sqlDate(data[0].dateTo)]
          }
        };

        validate.process(dependencies, ['offDays'])
        .then(function (model) {
          $scope.dataOffDays = model.offDays;
          for(var i = 0; i < model.offDays.data.length; i++){
            model.offDays.data[i].rate_offDay = (model.offDays.data[i].percent_pay) * ($scope.daly_rate / 100);
            $scope.TotalPaid += model.offDays.data[i].rate_offDay;
            $scope.TotalNet += model.offDays.data[i].rate_offDay;
          }
        });
      }

      function getPPConf() {
        dependencies.paiement_period_conf = {
          required : true,
          query : {
            tables : {
              'config_paiement_period' : {
                columns : ['id', 'weekFrom', 'weekTo']
              }
            },
            where : ['config_paiement_period.paiement_period_id=' + data[0].paiement_period_id]
          }
        };

        validate.process(dependencies, ['paiement_period_conf'])
        .then(function (model) {
          var paiement_period_confs = model.paiement_period_conf.data;
          $scope.max_day = getMaxDays(paiement_period_confs);
          getOffDayCount();
          getHollyDayCount(paiement_period_confs);
          getOffDay();
        });
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
      $scope.dataPaiements = data;
    });


    dependencies.get_rubric = {
      query : {
        tables : {
          'rubric_paiement' : {
            columns : ['id', 'paiement_uuid', 'value', 'rubric_id']
          },
          'rubric' : {
            columns : ['id', 'label', 'is_discount']
          }
        },
        join : [
          'rubric_paiement.rubric_id=rubric.id'
        ],
        where : [
          'rubric_paiement.paiement_uuid=' + invoiceId
        ]
      }
    };
    validate.process(dependencies, ['get_rubric'])
    .then(function (model) {
      var dataRubrics = $scope.dataRubrics = model.get_rubric.data;
      dataRubrics.forEach(function (item) {
        if(item.is_discount === 0){
          $scope.TotalPaid += item.value;
          item.valueP = item.value;
          item.valueR = 0;
          $scope.TotalNet += item.value;
        } else if(item.is_discount === 1){
          $scope.TotalWithheld += item.value;
          item.valueP = 0;
          item.valueR = item.value;
          $scope.TotalNet -= item.value;
        }
      });
    });

    dependencies.get_tax = {
      query : {
        tables : {
          'tax_paiement' : {
            columns : ['id', 'paiement_uuid', 'value', 'tax_id']
          },
          'tax' : {
            columns : ['id', 'label', 'is_employee']
          }
        },
        join : [
          'tax_paiement.tax_id=tax.id'
        ],
        where : [
          'tax.is_employee=' + 1, 'AND' ,'tax_paiement.paiement_uuid=' + invoiceId
        ]
      }
    };
    validate.process(dependencies, ['get_tax'])
    .then(function (model) {
      var dataTaxes = $scope.dataTaxes = model.get_tax.data;
      dataTaxes.forEach(function (item) {
        $scope.TotalWithheld += item.value;
        $scope.TotalNet -= item.value;
      });
    });

    dependencies.get_cotisation = {
      query : {
        tables : {
          'cotisation_paiement' : {
            columns : ['id', 'paiement_uuid', 'value', 'cotisation_id']
          },
          'cotisation' : {
            columns : ['id', 'label', 'is_employee']
          }
        },
        join : [
          'cotisation_paiement.cotisation_id=cotisation.id'
        ],
        where : [
          'cotisation.is_employee=' + 1, 'AND' ,'cotisation_paiement.paiement_uuid=' + invoiceId
        ]
      }
    };
    validate.process(dependencies, ['get_cotisation'])
    .then(function (model) {
      $scope.dataCotisation = model.get_cotisation.data;
      var cotisationValue = model.get_cotisation.data;
      cotisationValue.forEach(function (item) {
        $scope.TotalWithheld += item.value;
        $scope.TotalNet -= item.value;
      });
    });
  }

  function promiseInvoiceId (invoiceId) {
    return $q.when(invoiceId);
  }

	appstate.register('receipts.commonData', function (commonData) {
		commonData.then(function (values) {
      model.common.location = values.location.data.pop();
      model.common.InvoiceId = values.invoiceId;
      model.common.enterprise = values.enterprise.data.pop();
      promiseInvoiceId(values.invoiceId)
      .then(processPayslip)
      .catch(function (err){
        messenger.danger('error', err);
      });
		});
  });
  }
]);
