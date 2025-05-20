const devData = require('../data/development-data/index.js');
const seed = require('./seed.js');

const runSeed = async () => {
  try {
    await seed(devData);
    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

runSeed();