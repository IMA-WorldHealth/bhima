angular.module('bhima.services')
.service('FluxService', FluxService);

// dependencies injection 
FluxService.$inject = ['PrototypeApiService'];

// service definition 
function FluxService(Api) {
    var service = new Api('/stock/flux');

    service.translate = {
        1: 'STOCK_FLUX.FROM_PURCHASE',
        2: 'STOCK_FLUX.FROM_OTHER_DEPOT',
        3: 'STOCK_FLUX.FROM_ADJUSTMENT',
        4: 'STOCK_FLUX.FROM_PATIENT',
        5: 'STOCK_FLUX.FROM_SERVICE',
        6: 'STOCK_FLUX.FROM_DONATION',
        7: 'STOCK_FLUX.FROM_LOSS',
        8: 'STOCK_FLUX.TO_OTHER_DEPOT',
        9: 'STOCK_FLUX.TO_PATIENT',
        10: 'STOCK_FLUX.TO_SERVICE',
        11: 'STOCK_FLUX.TO_LOSS',
        12: 'STOCK_FLUX.TO_ADJUSTMENT',
        13: 'STOCK_FLUX.FROM_INTEGRATION',
    };

    return service;
}

