var test = require('node:test');
var assert = require('node:assert/strict');
var inventory = require('../lib/inventory');
var orders = require('../lib/orders');

test('sellable stock subtracts reservations and is floored at zero', function () {
  assert.equal(inventory.getSellableStock({ stock: 5, reserved: 2 }), 3);
  assert.equal(inventory.getSellableStock({ stock: 5 }), 5);
  assert.equal(inventory.getSellableStock({ stock: 2, reserved: 5 }), 0);
});

test('CURRENT BEHAVIOUR: inventory rejects the last sellable unit', function () {
  var product = { id: 1, name: 'Rice', stock: 5, reserved: 4 };

  assert.equal(inventory.getSellableStock(product), 1);
  assert.deepEqual(inventory.check([product], [{ id: 1, qty: 1 }]), {
    ok: false,
    msg: 'Rice is out of stock (1 sellable available)'
  });
});

test('CURRENT BEHAVIOUR: inventory rejects a quantity equal to all sellable units', function () {
  var products = [{ id: 1, name: 'Rice', stock: 5, reserved: 2 }];

  assert.deepEqual(inventory.check(products, [{ id: 1, qty: 3 }]), {
    ok: false,
    msg: 'Rice is out of stock (3 sellable available)'
  });
});

test('checkout can sell one fewer than the sellable count and deducts physical stock', function () {
  var product = { id: 1, name: 'Rice', stock: 5, reserved: 2 };
  var items = [{ id: 1, qty: 2 }];

  assert.deepEqual(inventory.check([product], items), { ok: true });
  inventory.reserve([product], items);

  assert.equal(product.stock, 3);
  assert.equal(product.reserved, 2);
  assert.equal(inventory.getSellableStock(product), 1);
});

test('CURRENT BEHAVIOUR: cancelling a checkout order leaves physical and sellable stock reduced', function () {
  var product = { id: 1, name: 'Rice', stock: 5, reserved: 2 };
  var db = { products: [product], orders: [], nextOrderId: 1001 };
  // Checkout deducts stock and stores line items keyed by id.
  var items = [{ id: 1, qty: 1 }];
  inventory.reserve(db.products, items);
  var order = orders.add(db, { items: items });

  assert.deepEqual(orders.cancel(db, order.id, 'Customer request'), { ok: true, order: order });
  assert.equal(db.orders[0].status, 'cancelled');
  assert.equal(db.orders[0].cancelReason, 'Customer request');
  assert.equal(product.stock, 4);
  assert.equal(product.reserved, 2);
  assert.equal(inventory.getSellableStock(product), 2);
});

test('CURRENT BEHAVIOUR: release with a matching productId only reduces reserved stock', function () {
  var product = { id: 1, name: 'Rice', stock: 5, reserved: 3 };

  inventory.release([product], [{ productId: 1, qty: 2 }]);

  assert.equal(product.stock, 5);
  assert.equal(product.reserved, 1);
  assert.equal(inventory.getSellableStock(product), 4);
});
