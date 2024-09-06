const { ObjectId } = require("mongodb");
const database = require('../services/dbService');
const db = database.client.db("zawody");

const getGroupsByCompetitionId = async (idzawodow) => {
  return db
    .collection("grupy")
    .find({ idzawodow: new ObjectId(idzawodow) })
    .sort({ grupid: 1 })
    .toArray();
};

const updateGroupResults = async (id, wygrane, sety, miejsca, zawodnicy) => {
  return db.collection("grupy").findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        wygrane: wygrane,
        sety: sety,
        miejsce: miejsca,
        zawodnicy: zawodnicy,
      },
    }
  );
};


module.exports = { getGroupsByCompetitionId,updateGroupResults };