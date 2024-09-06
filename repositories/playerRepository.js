const { ObjectId } = require("mongodb");
const database = require("../services/dbService");
const db = database.client.db("druzyna");
const collection = db.collection("zawodnik");

const getPlayersByIds = async (ids) => {
  return collection
    .find({
      _id: { $in: ids.map((id) => new ObjectId(id)) },
    })
    .sort({ ranking: -1 })
    .toArray();
};

const getAllPlayers = async () => {
  return await collection.find({}).toArray();
};

const findAll = async (sorting) => {
  return await collection.find({ usuniety: false }).sort(sorting).toArray();
};

const create = async (player) => {
  const result = await collection.insertOne(player);
  return { ...player, _id: result.insertedId };
};

const update = async (id, player) => {
  await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: player }
  );
  return player;
};

const softDelete = async (id) => {
  await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { usuniety: true } }
  );
};

const getFree = async () => {
  const results = await collection.find({ imie: "Wolny" }).toArray();
  return results[0]._id;
};

module.exports = {
  getPlayersByIds,
  getAllPlayers,
  findAll,
  getFree,
  create,
  update,
  softDelete,
};
