var test = require('node:test');
var assert = require('node:assert/strict');
var orders = require('../lib/orders');

function orderHistory() {
  return {
    orders: [
      { id: 1001, date: '28/12/2021' },
      { id: 1004, date: '30/01/2022' },
      { id: 1007, date: '04/03/2022' },
      { id: 1008, date: '15/03/2022' }
    ]
  };
}

function orderIds(rows) {
  return rows.map(function (order) { return order.id; });
}

test('CURRENT BEHAVIOUR: order history sorts by day before month and year', function () {
  var db = orderHistory();

  assert.deepEqual(orderIds(orders.list(db)), [1004, 1001, 1008, 1007]);
  assert.deepEqual(orderIds(db.orders), [1001, 1004, 1007, 1008]);
});

test('CURRENT BEHAVIOUR: January date range includes December and March orders', function () {
  var result = orders.list(orderHistory(), { from: '2022-01-01', to: '2022-01-31' });

  assert.deepEqual(orderIds(result), [1004, 1001, 1008, 1007]);
});

test('order history includes both date boundaries within the same month', function () {
  var db = {
    orders: [
      { id: 1, date: '09/01/2022' },
      { id: 2, date: '10/01/2022' },
      { id: 3, date: '20/01/2022' },
      { id: 4, date: '21/01/2022' }
    ]
  };

  assert.deepEqual(orderIds(orders.list(db, { from: '2022-01-10', to: '2022-01-20' })), [3, 2]);
});
