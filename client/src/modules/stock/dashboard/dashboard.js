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
  const depots = [];

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
              depots.push(depot.uuid);
            }
          });
        });

        // console.log('PLUSSSSSsssssssssss');
        // console.log(vm.userDepots);

        return StockDashBoard.read({ depots });
      })
      .then(results => {

        // vm.depots = data;
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });

  }

  startup();
}
