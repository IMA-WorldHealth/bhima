// Export the same configuration object for use throughout modules
var development = {
  'port' : 8080,
  'db' : {
    'host':     'localhost',
    'user':     'bhima',
    'password': 'HISCongo2013',
    'database': 'bhima_test'
  },
  'logLevel' : 'none',
  'session' : {
    'secret' : 'xopen blowfish',
    'resave' : false,
    'saveUninitialized' : false,
    'reapInterval' : -1 // disables session reaping
  },
  'uploadFolder' : 'client/upload/',

  /* Configuration for plugins
   * Each plugin REQUIRES two properties:
   * name      - Stored as the name of the plugin. Write in camelCase.
   * script    - The script relative to the plugins directory
   *e.g : {'name' : 'mail', 'script' : '/../../plugins/mail/index.js'}
  */
  'plugins' : [],
  'tls' : {
    'key' : 'server/config/keys/server.key',
    'cert' : 'server/config/keys/server.crt'
  }
};

module.exports = development;
