const { ObjectId } = require("mongodb");
const { addtorankingarray, addtopair } = require("../services/ranking");
const { sortByProperty } = require("../services/operations");

const database = require("../services/db");
const db = database.client.db("zawody");
const db2 = database.client.db("druzyna");

const handleAdd = async (req, res) => {
  try {
    const { idzawodow, idrankingu } = req.body;
    const ranking = await db2
      .collection("rankingi")
      .find({ _id: new ObjectId(idrankingu) })
      .toArray();
    const turnieje = ranking[0].turnieje;
    const index = turnieje.indexOf(idzawodow);

    if (index !== -1) {
      res.status(203).json(res);
    }

    turnieje.push(idzawodow);

    await db2
      .collection("rankingi")
      .findOneAndUpdate(
        { _id: new ObjectId(idrankingu) },
        { $set: { turnieje: turnieje } }
      );

    const mecze = await db
      .collection("mecze")
      .find({ idzawodow: new ObjectId(idzawodow) })
      .toArray();

    let result = [];

    mecze.map((mecz) => {
      if (mecz.player1sets == 3 || mecz.player2sets == 3) {
        const sety = mecz.player1sets + mecz.player2sets;

        let p1 = 0;
        let p2 = 0;

        mecz.player1sets === 3 ? (p1 = 1) : (p2 = 1);

        addtopair(
          mecz._id,
          mecz.player1sets,
          mecz.player2sets,
          mecz.player1id,
          mecz.player2id,
          sety
        );

        result = addtorankingarray(
          result,
          mecz.player1id,
          sety,
          mecz.player1sets,
          p1
        );

        result = addtorankingarray(
          result,
          mecz.player2id,
          sety,
          mecz.player2sets,
          p2
        );
      }
    });

    const collection = db2.collection("ranks");
    await Promise.all(
      result.map(async (item) => {
        const filter = {
          playerid: new ObjectId(item.playerid),
          rankingid: new ObjectId(idrankingu),
        };
        const rank = await collection.findOne(filter);
        const field = {
          rankingid: new ObjectId(idrankingu),
          playerid: item.playerid,
          sets: item.sets,
          winsets: item.winsets,
          match: item.match,
          winmatch: item.winmatch,
          tournaments: 1,
        };
        if (rank) {
          await collection.findOneAndUpdate(filter, {
            $inc: {
              sets: item.sets,
              winsets: item.winsets,
              match: item.match,
              winmatch: item.winmatch,
              tournaments: 1,
            },
          });
        } else {
          await collection.insertOne(field);
        }
      })
    );
    res.status(200).json(res);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

const handleShow = async (req, res) => {
  try {
    const idrankingu = req.query.idrankingu;
    const user1 = req.query.user1;
    const user2 = req.query.user2;
    const zawodniki = await db2.collection("zawodnik").find({}).toArray();
    const ranking = await db2
      .collection("ranks")
      .find({ rankingid: new ObjectId(idrankingu) })
      .toArray();
    let index = 1;
    ranking.map((item) => {
      const zawodnik = zawodniki.find((zaw) => zaw._id.equals(item.playerid));

      item.name = zawodnik.nazwisko + " " + zawodnik.imie;
      item.id = index;
      index++;

      item.setspercent = item.winsets / item.sets;
      item.matchpercent = item.winmatch / item.match;
      item.playerid = item.playerid.toString();
    });

    if (user1 && user2) {
      const idsToKeep = [user1._id, user2._id];
      const filteredArray = ranking.filter((dataObject) => {
        return idsToKeep.includes(dataObject.playerid);
      });

      const collection = db2.collection("pary");
      const filter = {
        $or: [
          {
            $and: [
              { player1id: new ObjectId(filteredArray[0].playerid) },
              { player2id: new ObjectId(filteredArray[1].playerid) },
            ],
          },
          {
            $and: [
              { player1id: new ObjectId(filteredArray[1].playerid) },
              { player2id: new ObjectId(filteredArray[0].playerid) },
            ],
          },
        ],
      };
      const ranks = await collection.find(filter).toArray();

      if (ranks.length > 0) {
        if (
          ranks[0].player1id.equals(new ObjectId(filteredArray[0].playerid))
        ) {
          filteredArray[0].pairmatch = ranks[0].p1match;
          filteredArray[0].pairsets = ranks[0].p1sets;
          filteredArray[1].pairmatch = ranks[0].p2match;
          filteredArray[1].pairsets = ranks[0].p2sets;

          filteredArray[0].pairmatchp = ranks[0].p1match / ranks[0].matchplayed;
          filteredArray[1].pairmatchp = ranks[0].p2match / ranks[0].matchplayed;

          filteredArray[0].pairsetsp = ranks[0].p1sets / ranks[0].setsplayed;
          filteredArray[1].pairsetsp = ranks[0].p2sets / ranks[0].setsplayed;
        } else {
          filteredArray[1].pairmatch = ranks[0].p1match;
          filteredArray[1].pairsets = ranks[0].p1sets;
          filteredArray[0].pairmatch = ranks[0].p2match;
          filteredArray[0].pairsets = ranks[0].p2sets;

          filteredArray[1].pairmatchp = ranks[0].p1match / ranks[0].matchplayed;
          filteredArray[0].pairmatchp = ranks[0].p2match / ranks[0].matchplayed;

          filteredArray[1].pairsetsp = ranks[0].p1sets / ranks[0].setsplayed;
          filteredArray[0].pairsetsp = ranks[0].p2sets / ranks[0].setsplayed;
        }

        filteredArray[0].pairmatchplayed = ranks[0].matchplayed;
        filteredArray[0].pairsetsplayed = ranks[0].setsplayed;

        filteredArray[1].pairmatchplayed = ranks[0].matchplayed;
        filteredArray[1].pairsetsplayed = ranks[0].setsplayed;
      }
      res.status(200).json(filteredArray);
    } else {
      const sorted = sortByProperty(
        ranking,
        "matchpercent",
        "setspercent",
        false
      );
      res.status(200).json(sorted);
    }
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

const handleList = async (req, res) => {
  try {
    const collection = db2.collection("rankingi");
    const results = await collection.find({}).sort({ _id: 1 }).toArray();
    res.status(200).json(results);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

module.exports = { handleAdd, handleShow, handleList };
