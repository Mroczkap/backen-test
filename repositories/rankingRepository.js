const { ObjectId } = require("mongodb");
const database = require("../services/dbService");
const db = database.client.db("druzyna");
const rankingiCollection = db.collection("rankingi");
const rankCollection = db.collection("ranks");
const zawodnikCollection = db.collection("zawodnik");
const pairCollection = db.collection("pary");
const matchCollection = database.client.db("zawody").collection("mecze");

const addTournamentToRanking = async (idzawodow, idrankingu) => {
  await rankingiCollection.updateOne(
    { _id: new ObjectId(idrankingu) },
    { $push: { turnieje: idzawodow } }
  );
};

const getRankingById = async (idrankingu) => {
  return await rankingiCollection.findOne({ _id: new ObjectId(idrankingu) });
};

const findMainRanking = async () => {
  return rankingiCollection.find({ opis: "Main" }).toArray();
};

const getMatchesByTournament = async (idzawodow) => {
  return await matchCollection
    .find({ idzawodow: new ObjectId(idzawodow) })
    .toArray();
};

const updatePlayerRank = async (playerid, idrankingu, updateData) => {
  const filter = {
    playerid: new ObjectId(playerid),
    rankingid: new ObjectId(idrankingu),
  };
  await rankCollection.updateOne(
    filter,
    { $inc: updateData },
    { upsert: true }
  );
};

const getRankingPlayers = async (idrankingu) => {
  return await rankCollection
    .find({ rankingid: new ObjectId(idrankingu) })
    .toArray();
};

const getAllPlayers = async () => {
  return await zawodnikCollection.find({}).toArray();
};

const getPairData = async (player1id, player2id) => {
  return await pairCollection.findOne({
    $or: [
      {
        player1id: new ObjectId(player1id),
        player2id: new ObjectId(player2id),
      },
      {
        player1id: new ObjectId(player2id),
        player2id: new ObjectId(player1id),
      },
    ],
  });
};

const updatePair = async (filter, update) => {
  return pairCollection.findOneAndUpdate(filter, update);
};

const insertPair = async (pair) => {
  return pairCollection.insertOne(pair);
};

const listRankings = async () => {
  return await rankingiCollection.find({}).sort({ _id: 1 }).toArray();
};

const insertRank = async (rankData) => {
  return rankCollection.insertOne(rankData);
};

module.exports = {
  insertRank,
  addTournamentToRanking,
  getRankingById,
  getMatchesByTournament,
  updatePlayerRank,
  getRankingPlayers,
  getAllPlayers,
  getPairData,
  listRankings,updatePair,insertPair,
  findMainRanking
};
