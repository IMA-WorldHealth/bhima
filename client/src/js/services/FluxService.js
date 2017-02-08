angular.module('bhima.services')
.service('FluxService', FluxService);

// dependencies injection 
FluxService.$inject = ['$translate'];

// service definition 
function FluxService($translate) {
    var service = this;

    service.translate = {
        1: $translate.instant('STOCK_FLUX.FROM_PURCHASE'),
        2: $translate.instant('STOCK_FLUX.FROM_OTHER_DEPOT'),
        3: $translate.instant('STOCK_FLUX.FROM_ADJUSTMENT'),
        4: $translate.instant('STOCK_FLUX.FROM_PATIENT'),
        5: $translate.instant('STOCK_FLUX.FROM_SERVICE'),
        6: $translate.instant('STOCK_FLUX.FROM_DONATION'),
        7: $translate.instant('STOCK_FLUX.FROM_LOSS'),
        8: $translate.instant('STOCK_FLUX.TO_OTHER_DEPOT'),
        9: $translate.instant('STOCK_FLUX.TO_PATIENT'),
        10: $translate.instant('STOCK_FLUX.TO_SERVICE'),
        11: $translate.instant('STOCK_FLUX.TO_LOSS'),
        12: $translate.instant('STOCK_FLUX.TO_ADJUSTMENT')
    };

    return service;
}

