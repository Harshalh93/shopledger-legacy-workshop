var test = require('node:test');
var assert = require('node:assert/strict');
var ledger = require('../lib/ledger');

function customerLedger() {
  return {
    nextSettlementId: 501,
    settlements: [],
    customers: [{ id: 1, name: 'Meera Joshi', openingBalance: 450, totalBilled: 1982.01, totalSettled: 1200 }]
  };
}

test('a numeric Khata payment increases total settled and reduces the balance due', function () {
  var db = customerLedger();

  assert.equal(ledger.listCustomers(db)[0].balance, 1232.01);
  var result = ledger.recordSettlement(db, 1, 500, 'cash', 'Part payment');

  assert.equal(result.ok, true);
  assert.equal(result.settlement.amount, 500);
  assert.equal(result.customer.totalSettled, 1700);
  assert.equal(result.customer.balance, 732.01);
  assert.equal(ledger.listCustomers(db)[0].balance, 732.01);
  assert.deepEqual(db.settlements, [result.settlement]);
});

test('CURRENT BEHAVIOUR: a Khata form amount concatenates into total settled and corrupts the balance', function () {
  var db = customerLedger();
  // The settlement form sends the amount as a string, which the route forwards unchanged.
  var result = ledger.recordSettlement(db, '1', '500', 'cash', 'Part payment');

  assert.equal(result.ok, true);
  assert.equal(db.customers[0].totalSettled, '1200500');
  assert.equal(db.customers[0].balance, -1198067.99);
  assert.equal(ledger.listCustomers(db)[0].balance, -1198067.99);
  assert.equal(db.settlements[0].amount, 500);
});

test('a zero Khata payment is rejected before any ledger changes', function () {
  var db = customerLedger();

  assert.deepEqual(ledger.recordSettlement(db, '1', '0'), {
    ok: false,
    error: 'Settlement amount must be greater than zero'
  });
  assert.deepEqual(db, customerLedger());
});
