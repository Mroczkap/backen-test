const { ObjectId } = require('mongodb');
const database = require("../services/dbService");
const db = database.client.db("zawody");


const getResultsByCompetitionId = async (idzawodow) => {
  const collection = db.collection("wyniki");
  return collection
    .find({ idzawodow: new ObjectId(idzawodow) })
    .sort({ miejsce: 1 })
    .toArray();
};

module.exports = { getResultsByCompetitionId };