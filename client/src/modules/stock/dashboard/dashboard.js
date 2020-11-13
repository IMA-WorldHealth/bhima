angular.module('bhima.controllers')
  .controller('StockDashBoardController', StockDashBoardController);

StockDashBoardController.$inject = [
  'UserService', 'SessionService', 'DepotService', 'NotifyService', 'StockDashBoardService',
];

/**
 * @function StockDashBoardController
 *
 * @description
 * This controller binds the basic CRUD operations on the enterprise.
 */
function StockDashBoardController(Users, Session, Depots, Notify, StockDashBoard) {
  const vm = this;

  const userId = Session.user.id;
  vm.userDepots = [];
  const depotUuids = [];

  // fired on startup
  function startup() {
    Depots.read(null)
      .then(data => {
        vm.depots = data;

        return Users.depots(userId);
      })
      .then(data => {

        vm.depots.forEach(depot => {
          data.forEach(item => {
            if (depot.uuid === item) {
              vm.userDepots.push(depot);
              depotUuids.push(depot.uuid);
            }
          });
        });

        return StockDashBoard.read({ depots : depotUuids });
      })
      .then(dataDashboard => {
        vm.dataDashboard = dataDashboard;

        console.log('NEWWWwwwwwwwww');
        console.log(vm.dataDashboard);
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });

  }

  startup();
}
