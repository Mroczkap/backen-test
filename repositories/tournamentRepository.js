const database = require('../services/dbService');
const { ObjectId } = require('mongodb');
const tournamentUtils = require('../utils/tournamentUtils');

const getCollection = () => {
  return database.client.db("zawody").collection("turnieje");
};

const createTournament = async (tournamentData) => {
  const collection = getCollection();
  try {
    const result = await collection.insertOne(tournamentData);
    return { ...tournamentData, _id: result.insertedId };
  } catch (error) {
    console.error('Error creating tournament:', error);
    throw error;
  }
};

const findAllTournaments = async () => {
  const collection = getCollection();
  try {
    return await collection
      .find({})
      .sort({ _id: -1 })
      .project({ zawodnicy: 0, liczbagrup: 0 })
      .toArray();
  } catch (error) {
    console.error('Error finding tournaments:', error);
    throw error;
  }
};

const createGroupMatchesForTournament = async (tournamentId, groups) => {
  const db = database.client.db('zawody');
  try {
    let groupId = 0;
    for (const group of groups) {
      groupId++;
      const array = new Array(group.length).fill(0);

      const insertGroupResult = await db.collection("grupy").insertOne({
        grupid: groupId,
        idzawodow: tournamentId,
        zawodnicy: group,
        wygrane: array,
        sety: array,
        miejsce: array,
      });

      const groupDbId = insertGroupResult.insertedId;
      const matches = tournamentUtils.generateGroupMatches(group);

      for (const match of matches) {
        await db.collection("mecze").insertOne({
          idzawodow: tournamentId,
          idgrupy: groupDbId,
          player1id: match[0],
          player2id: match[1],
          player1sets: 0,
          player2sets: 0,
          inprogress: false,
        });
      }
    }
  } catch (error) {
    console.error('Error creating group matches:', error);
    throw error;
  }
};

const createRoundForTournament = async (tournamentId, roundName, matchCount) => {
  const db = database.client.db('zawody');
  try {
    const matches = Array.from({ length: matchCount }, (_, i) => ({
      idzawodow: tournamentId,
      round: roundName,
      idmeczu: i + 1,
      player1id: "",
      player2id: "",
      player1sets: 0,
      player2sets: 0,
      inprogress: false,
    }));
    await db.collection("mecze").insertMany(matches);
  } catch (error) {
    console.error('Error creating tournament round:', error);
    throw error;
  }
};

const createResultsForTournament = async (tournamentId, playerCount) => {
  const db = database.client.db('zawody');
  try {
    const results = Array.from({ length: playerCount }, (_, i) => ({
      idzawodow: tournamentId,
      idzawodnika: "",
      miejsce: i + 1,
    }));
    await db.collection("wyniki").insertMany(results);
  } catch (error) {
    console.error('Error creating tournament results:', error);
    throw error;
  }
};

const getTournamentResults = async (tournamentId) => {
  const db = database.client.db('zawody');
  try {
    return await db.collection('wyniki')
      .find({ idzawodow: new ObjectId(tournamentId) })
      .sort({ miejsce: 1 })
      .toArray();
  } catch (error) {
    console.error('Error getting tournament results:', error);
    throw error;
  }
};

module.exports = {
  createTournament,
  findAllTournaments,
  createGroupMatchesForTournament,
  createRoundForTournament,
  createResultsForTournament,
  getTournamentResults
};