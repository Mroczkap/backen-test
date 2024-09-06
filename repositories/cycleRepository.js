const { ObjectId } = require('mongodb');
const database = require('../services/dbService');
const db = database.client.db('druzyna');
const db2 = database.client.db('data')
const cykleCollection = db.collection('cykle');
const cyklCollection = db.collection('cykl');
const pointCollection = db2.collection('point')

const getCycleById = async (cycleId) => {
  return await cykleCollection.findOne({ _id: new ObjectId(cycleId) });
};

const addTournamentToCycle = async (cycleId, tournamentId) => {
  await cykleCollection.updateOne(
    { _id: new ObjectId(cycleId) },
    { $push: { turnieje: tournamentId }, $inc: { count: 1 } }
  );
};

const getPointSystem = async (name) => {
  return await pointCollection.findOne({ name: name });
};

const addCycleEntry = async (cycleEntry) => {
  await cyklCollection.insertOne(cycleEntry);
};

const getCycleEntries = async (cycleId) => {
  return await cyklCollection.find({ cyklid: new ObjectId(cycleId) }).toArray();
};

const getAllCycles = async () => {
  return await cykleCollection.find({}).sort({ _id: 1 }).toArray();
};

module.exports = { 
  getCycleById, 
  addTournamentToCycle, 
  getPointSystem, 
  addCycleEntry, 
  getCycleEntries, 
  getAllCycles 
};