var expect = require('chai').expect,
    parser = require('../lib/parser');

//var describe, it;

describe('parser', function () {

  // TODO : How should these fail?
  describe('#select()', function () {

    it('should compose a SELECT query on a single table', function () {
      var query, results, answer;

      query = {
        'tables' : { 'account' : { 'columns' : [ 'id', 'number'] } }
      };

      results = parser.select(query);
      answer = 'SELECT account.id, account.number FROM account WHERE 1;';

      expect(results).to.equal(answer);
    });

    it('should compose a SELECT query on three tables with two JOIN conditions', function () {
      var query, results, answer;

      query = {
        tables : {
          'permission' : { columns : ['id', 'id_unit', 'id_user'] },
          'unit' : { columns : ['name', 'key', 'label'] },
          'user' : { columns : ['username', 'email'] }
        },
        join : ['permission.id_unit=unit.id', 'permission.id_user=user.id']
      };

      results = parser.select(query);

      answer =
        'SELECT permission.id, permission.id_unit, permission.id_user, ' +
          'unit.name, unit.key, unit.label, user.username, ' +
          'user.email ' +
        'FROM permission JOIN unit JOIN user ON ' +
          'permission.id_unit=unit.id AND ' +
          'permission.id_user=user.id WHERE 1;';

      expect(results).to.equal(answer);
    });

    it('should compose a SELECT query on a single table with WHERE conditions', function () {
      var query, results, answer;

      query = {
        tables : {
          'account' : { columns : ['id', 'account_number', 'account_txt', 'locked'] }
        },
        where : ['account.locked<>0', 'AND', 'account.account_number>=100']
      };

      results = parser.select(query);

      answer =
        'SELECT account.id, account.account_number, account.account_txt, ' +
          'account.locked ' +
        'FROM account ' +
        'WHERE account.locked<>\'0\' AND account.account_number>=\'100\';';

      expect(results).to.equal(answer);
    });

    it('should compose a SELECT query on a single table with WHERE conditions including an IN', function () {
      var query, results, answer;

      query = {
        tables : {
          'account' : { columns : ['id', 'account_type_id', 'account_number', 'account_txt', 'locked'] }
        },
        where : ['account.account_type_id IN (1,4)', 'AND', 'account.locked=0']
      };

      results = parser.select(query);

      answer =
        'SELECT account.id, account.account_type_id, account.account_number, ' +
	'account.account_txt, account.locked ' +
        'FROM account ' +
        'WHERE account.account_type_id IN (1,4) AND account.locked=\'0\';';

      expect(results).to.equal(answer);
    });

    it('should compose a SELECT query on a single table with WHERE conditions including an IN with strings', function () {
      var query, results, answer;

      query = {
        tables : {
          'account' : { columns : ['id', 'account_type_id', 'account_number', 'account_txt'] },
	  'account_type' : { columns : ['type::account_type'] }
        },
	join : ['account_type.id = acount.account_type_id'],
        where : ['account.account_type IN (\'income\',\'expense\')']
      };

      results = parser.select(query);

      answer =
	"SELECT account.id, account.account_type_id, account.account_number, account.account_txt, " + 
	"account_type.type as account_type " + 
	"FROM account " + 
	"JOIN account_type ON account_type.id = acount.account_type_id " + 
	"WHERE account.account_type IN ('income','expense');"

      expect(results).to.equal(answer);
    });

    it('should compose a SELECT query on two JOINed tables with nested WHERE conditions', function () {
      var query, results, answer;

      query = {
        tables : {
          'enterprise' : {
            columns : ['id', 'name', 'location_id', 'phone', 'email', 'account_group_id']
          },
          'account_group' : { columns : ['account_number', 'ordering'] }
        },
        where : ['enterprise.id=1', 'AND', ['account_group.account_number<100', 'OR',
          'account_group.account_number>150']],
        join : ['enterprise.account_group_id=account_group.id']
      };

      results = parser.select(query);

      answer =
        'SELECT enterprise.id, enterprise.name, enterprise.location_id, ' +
          'enterprise.phone, enterprise.email, enterprise.account_group_id, ' +
          'account_group.account_number, account_group.ordering ' +
        'FROM enterprise JOIN account_group ON ' +
          'enterprise.account_group_id=account_group.id ' +
        'WHERE enterprise.id=\'1\' AND (account_group.account_number<\'100\' OR ' +
          'account_group.account_number>\'150\');';

      expect(results).to.equal(answer);
    });

    it('should compose a SELECT query on a single table with LIMITed rows', function () {
      var query, results, answer;

      query = {
        tables : {
          'debtor' : { columns : ['id', 'name', 'location_id', 'group_id'] }
        },
        limit : 30
      };

      results = parser.select(query);

      answer =
        'SELECT debtor.id, debtor.name, debtor.location_id, debtor.group_id ' +
        'FROM debtor WHERE 1 LIMIT 30;';

      expect(results).to.equal(answer);
    });

    it('should compose a SELECT query on a single table with ORDER BY statement', function () {
      var query, results, answer;

      query = {
        tables : {
          'creditor' : { columns : ['id', 'name', 'group_id'] }
        },
        orderby: ['creditor.group_id']
      };

      results = parser.select(query);

      answer =
        'SELECT creditor.id, creditor.name, creditor.group_id ' +
        'FROM creditor WHERE 1 ORDER BY creditor.group_id;';

      expect(results).to.equal(answer);
    });

    it('should compose a DISTINCT SELECT query on a single table', function () {
      var query, results, answer;

      query = {
        tables : {
          'creditor' : { columns : ['id', 'name', 'group_id'] }
        },
        distinct : true
      };

      results = parser.select(query);

      answer =
        'SELECT DISTINCT creditor.id, creditor.name, creditor.group_id ' +
        'FROM creditor WHERE 1;';

      expect(results).to.equal(answer);
    });

    it('should compose a SELECT query with the LIKE syntax in the WHERE clause', function () {
      var query, results, answer;

      query = {
        tables : {
          'patient' : { columns : ['uuid', 'first_name', 'last_name'] }
        },
	where : [ 'patient.last_name LIKE john smith' ]
      };

      results = parser.select(query);

      answer =
        'SELECT patient.uuid, patient.first_name, patient.last_name ' +
        'FROM patient WHERE patient.last_name LIKE \'%john smith%\';';

      expect(results).to.equal(answer);
    });

    it('should compose a SELECT query with the :: for AS syntax in the selector', function () {
      var query, results, answer;

      query = {
        tables : {
          'patient' : { columns : ['uuid', 'first_name', 'last_name', 'dob::dateOfBirth'] }
        },
      };

      results = parser.select(query);

      answer =
        'SELECT patient.uuid, patient.first_name, patient.last_name, patient.dob as dateOfBirth ' +
        'FROM patient WHERE 1;';

      expect(results).to.equal(answer);
    });

    it('should compose high complexity SELECT queries', function () {
      var query, results, answer;

      query = {
        tables : {
          'enterprise' : { columns : ['id', 'name', 'location_id', 'account_group_id'] },
          'account_group' : { columns : ['account_number', 'ordering::account_ordering'] }
        },
        where : ['enterprise.id=1', 'AND', ['account_group.account_number<100', 'OR', 'account_group.account_number>=150']],
        join : ['enterprise.account_group_id=account_group.id'],
        orderby : ['account_group.account_number'],
        limit: 5
      };

      results = parser.select(query);

      answer =
        'SELECT enterprise.id, enterprise.name, enterprise.location_id, ' +
          'enterprise.account_group_id, account_group.account_number, ' +
          'account_group.ordering as account_ordering ' +
        'FROM enterprise JOIN account_group ON ' +
          'enterprise.account_group_id=account_group.id ' +
        'WHERE enterprise.id=\'1\' AND ' +
          '(account_group.account_number<\'100\' OR ' +
          'account_group.account_number>=\'150\') ' +
        'ORDER BY account_group.account_number ' +
        'LIMIT 5;';

      expect(results).to.equal(answer);

    });
  });

  describe('#delete()', function () {

    it('should compose a DELETE query on a single table with a numeric id', function () {
      var results, answer;

      results = parser.delete('account', 'id', 3);

      answer =
        'DELETE FROM account WHERE id IN (\'3\');';

      expect(results).to.equal(answer);
    });

    it('should compose a DELETE query on a single table with multiple ids', function () {
      var results, answer;

      results = parser.delete('account', 'id', [1,2,3,4]);

      answer =
        'DELETE FROM account WHERE id IN (\'1\', \'2\', \'3\', \'4\');';

      expect(results).to.equal(answer);
    });
  });

  // TODO
  //  Are there more complex test cases of updates?
  describe('#update()', function () {

    it('should compose an UPDATE query for a single table on an id', function () {
      var data, results, answer;

      data = { id : 1, url : '/some/url/content/', parent: 23 };

      results = parser.update('unit', data, 'id');

      answer =
        'UPDATE unit SET url=\'/some/url/content/\', parent=23 ' +
        'WHERE id=1;';

      expect(results).to.equal(answer);
    });

    it('should compose an UPDATE query with reserved words', function () {
      var data, results, answer;

      data = { id : 1, key : 23, title : 'hi'};

      results = parser.update('table', data, 'id');

      answer =
        'UPDATE table SET `key`=23, title=\'hi\' ' +
        'WHERE id=1;';

      expect(results).to.equal(answer);
    });

  });

  describe('#insert()', function () {

    it('should compose an INSERT query on a single table for one row', function () {
      var data, results, answer;
      data = [{ username : 'axelroad', email : 'axel@gmail.com' }];

      results = parser.insert('user', data);

      answer =
        'INSERT INTO user (username, email) VALUES ' +
          '(\'axelroad\', \'axel@gmail.com\');';

      expect(results).to.equal(answer);
    });

    it('should compose an INSERT query with reserved words', function () {
      var data, results, answer;
      data = [{ key: '1', index: '12', text : 'hello world'}];

      results = parser.insert('table', data);

      answer =
        'INSERT INTO table (`key`, `index`, text) VALUES ' +
          '(\'1\', \'12\', \'hello world\');';

      expect(results).to.equal(answer);
    });

    it('should compose an INSERT query on a single table for multiple rows', function () {
      var data, results, answer;

      data = [
        { code : 'CHGRAN', price : 100, text : 'Chirgerie' },
        { code : 'EXPYAN', price : 20, text : 'Extra Pain'}
      ];

      results = parser.insert('inventory', data);

      answer =
      'INSERT INTO inventory (code, price, text) VALUES ' +
        '(\'CHGRAN\', 100, \'Chirgerie\'), ' +
        '(\'EXPYAN\', 20, \'Extra Pain\');';

      expect(results).to.equal(answer);

    });

  });
});
