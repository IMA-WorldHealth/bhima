TODO
====

Server-side Components
- [ ] Modularize journal.js into separate routes
- [ ] Ensure mocha tests are written for all components
- [ ] Break up `uncategorized` routes into controllers
- [x] Impliment PluginManager.js and plugin architecture
  - [x] Figure out how to make plugins multi-threaded
  - [ ] Find a viable backup solution for hospital data
- [ ] Impliment logical error handling using [domains](https://nodejs.org/api/domain.html)
- [ ] Migrate database transactions to an ORM

Client-side Components
- [ ] Use bower to manage clientside dependencies
- [ ] Upgrade router to the [Angular 2 router](https://angular.github.io/router/getting-started)
- [ ] Remove logic from controllers into services
- [ ] Write unit tests for individual services
- [ ] Write e2e tests using protractor for all pages
- [ ] Rewrite the css in [semantic ui](http://semantic-ui.com/)
- [x] Optimize `gulp build` time

Miscellaneous TODOs
------------------

- [ ] Wrap slickgrid as a directive (`<data-grid id="glgrid"></data-grid>`)
- [ ] Make column selection dropdown (as seen on the GL page) a directive (`<column-selection data-columns="grid.columns"></column-selection>`)

Journal Voucher
- [x] Add the ability to assign cost centers to all lines (except balance accounts)
