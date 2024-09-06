const { ObjectId } = require("mongodb");

const database = require("../services/dbService");
const db = database.client.db("zawody");
const collectionMecze = db.collection("mecze");

const getMatchesByGroupId = async (groupId) => {
  return collectionMecze.find({ idgrupy: new ObjectId(groupId) }).toArray();
};

const getMatchesByGroupIds = async (groupIds) => {
  return collectionMecze.find({ idgrupy: { $in: groupIds } }).toArray();
};

const updateNextMatch = async (
  idzawodow,
  nextmatch,
  round,
  playerId,
  isPlayer1
) => {
  const updateField = isPlayer1 ? "player1" : "player2";
  return collectionMecze.findOneAndUpdate(
    {
      idzawodow: new ObjectId(idzawodow),
      idmeczu: nextmatch,
      round: round,
    },
    {
      $set: {
        [`${updateField}id`]: new ObjectId(playerId),
        [`${updateField}sets`]: 0,
      },
    }
  );
};

const updateMatch = async (idzawodow, idmeczu, round, updateData) => {
  try {
    const result = await collectionMecze.findOneAndUpdate(
      {
        idzawodow: new ObjectId(idzawodow),
        idmeczu: idmeczu,
        round: round,
      },
      updateData,
      { returnDocument: "after" }
    );

    if (!result.value) {
      throw new Error("Match not found");
    }

    return result.value;
  } catch (error) {
    console.error("Error updating match:", error);
    throw error;
  }
};

const findMatchesByZawody = async (idzawodow) => {
  return collectionMecze
    .find({ idzawodow: new ObjectId(idzawodow) })
    .sort({ idmeczu: 1 })
    .toArray();
};

const updateMatchScore = async (idmeczu, player1sets, player2sets) => {
  await collectionMecze.findOneAndUpdate(
    { _id: new ObjectId(idmeczu) },
    { $set: { player1sets, player2sets } }
  );
};

const saveResult = async (idzawodnika, miejsce, idzawodow) => {
  const collection = db.collection("wyniki");
  return await collection.findOneAndUpdate(
    {
      idzawodow: new ObjectId(idzawodow),
      miejsce: miejsce,
    },
    { $set: { idzawodnika: new ObjectId(idzawodnika) } }
  );
};

const markMatchAsSaved = async (idzawodow, idmeczu) => {
  await collectionMecze.findOneAndUpdate(
    { idzawodow: new ObjectId(idzawodow), _id: new ObjectId(idmeczu) },
    { $set: { saved: true } }
  );
};

const insertMatch = async (matchData) => {
  return collectionMecze.insertOne(matchData);
};

const getMatchesByDateRange = async (startDate, endDate) => {
  return collectionMecze
    .find({
      date: { $gte: startDate, $lte: endDate },
    })
    .sort({ date: 1 })
    .toArray();
};

const updateMatchProgress = async (id, inProgress) => {
  return collectionMecze.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { inprogress: inProgress } }
  );
};

module.exports = {
  getMatchesByGroupId,
  getMatchesByGroupIds,
  updateNextMatch,
  updateMatch,
  findMatchesByZawody,
  updateMatchScore,
  saveResult,
  updateMatchProgress,
  markMatchAsSaved,
  insertMatch,
  getMatchesByDateRange,
};
