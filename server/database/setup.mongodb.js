// Optional: creates the SpendWise database with validation rules and indexes.
// Run:  mongosh "mongodb://127.0.0.1:27017" --file database/setup.mongodb.js
// (The app also creates collections and indexes by itself; this file just makes everything explicit.)
const sdb = db.getSiblingDB('spendwise');

function ensure(name, schema) {
  const options = { validator: { $jsonSchema: schema }, validationLevel: 'moderate', validationAction: 'error' };
  if (sdb.getCollectionNames().includes(name)) sdb.runCommand({ collMod: name, ...options });
  else sdb.createCollection(name, options);
}
const num = ['double', 'int', 'long', 'decimal'];

ensure('users', {
  bsonType: 'object',
  required: ['name', 'email', 'passwordHash', 'currency'],
  properties: {
    name: { bsonType: 'string', minLength: 2, maxLength: 60 },
    email: { bsonType: 'string' },
    passwordHash: { bsonType: 'string' },
    currency: { enum: ['INR', 'USD', 'EUR', 'GBP'] },
  },
});
ensure('transactions', {
  bsonType: 'object',
  required: ['userId', 'title', 'type', 'amount', 'category', 'date'],
  properties: {
    userId: { bsonType: 'objectId' },
    title: { bsonType: 'string', maxLength: 100 },
    type: { enum: ['income', 'expense'] },
    amount: { bsonType: num, minimum: 0.01 },
    category: { bsonType: 'string' },
    date: { bsonType: 'date' },
    isDemo: { bsonType: 'bool' },
  },
});
ensure('budgets', {
  bsonType: 'object',
  required: ['userId', 'category', 'month', 'limitAmount'],
  properties: {
    userId: { bsonType: 'objectId' },
    category: { bsonType: 'string' },
    month: { bsonType: 'string', pattern: '^\\d{4}-(0[1-9]|1[0-2])$' },
    limitAmount: { bsonType: num, minimum: 0.01 },
  },
});

sdb.users.createIndex({ email: 1 }, { unique: true });
sdb.transactions.createIndex({ userId: 1, date: -1 });
sdb.transactions.createIndex({ userId: 1, type: 1, category: 1 });
sdb.budgets.createIndex({ userId: 1, month: 1, category: 1 }, { unique: true });

print('SpendWise database ready. Collections: ' + sdb.getCollectionNames().join(', '));
