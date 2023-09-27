const {ObjectId } = require("mongodb");
require("dotenv").config();
const database = require("../services/db");
const db = database.client.db('zawody')
const db2 = database.client.db("druzyna");
const {getFree} = require('../services/free')
const {
  player1nextMatch,
  player2nextMatch,
  saveResults,
  selectRound,
} = require("../services/nextMatch");
const { addtorankingarray } = require("../services/ranking");

const handleSave = async (req, res) => {
  try {
    // const mongoClient = await new MongoClient(
    //   process.env.MONGODB_URI,
    //   {useNewUrlParser: true}
    // ).connect();

    /* 
    req.body:
    [0] idmeczu
    [1] player1sets
    [2] player2sets
    [3] idgrupy
    [4] runda
    [5] player1id
    [6] player2id
    [7] idzawodów
    [8] nrmeczu
    */
    // const db = mongoClient.db("zawody");
    const collecion = db.collection("mecze");
    let id = req.body[0].toString();
    await collecion.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { player1sets: req.body[1], player2sets: req.body[2] } }
    );
    let runda = req.body[4].toString();

    const nextmatch = selectRound(runda, req.body[8]);

    console.log("co zawraca mecze", nextmatch);

    if (req.body[1] == 3 && nextmatch[0] == 1) {
      await player1nextMatch(
        collecion,
        new ObjectId(req.body[7]),
        nextmatch[1],
        runda,
        new ObjectId(req.body[5])
      );
      await  player1nextMatch(
        collecion,
        new ObjectId(req.body[7]),
        nextmatch[2],
        runda,
        new ObjectId(req.body[6])
      );
    }

    if (req.body[2] == 3 && nextmatch[0] == 1) {
      await  player1nextMatch(
        collecion,
        new ObjectId(req.body[7]),
        nextmatch[1],
        runda,
        new ObjectId(req.body[6])
      );
      await player1nextMatch(
        collecion,
        new ObjectId(req.body[7]),
        nextmatch[2],
        runda,
        new ObjectId(req.body[5])
      );
    }
    if (req.body[1] == 3 && nextmatch[0] == 2) {
      await player2nextMatch(
        collecion,
        new ObjectId(req.body[7]),
        nextmatch[1],
        runda,
        new ObjectId(req.body[5])
      );
      await player2nextMatch(
        collecion,
        new ObjectId(req.body[7]),
        nextmatch[2],
        runda,
        new ObjectId(req.body[6])
      );
    }
    if (req.body[2] == 3 && nextmatch[0] == 2) {
      await player2nextMatch(
        collecion,
        new ObjectId(req.body[7]),
        nextmatch[1],
        runda,
        new ObjectId(req.body[6])
      );
      await  player2nextMatch(
        collecion,
        new ObjectId(req.body[7]),
        nextmatch[2],
        runda,
        new ObjectId(req.body[5])
      );
    }

    if (nextmatch[0] == -1) {
      if (req.body[1] == 3) {
        await saveResults(
          db, //tutaj zapis do wyników
          new ObjectId(req.body[5]),
          nextmatch[1],
          new ObjectId(req.body[7])
        );
        await saveResults(
          db,
          new ObjectId(req.body[6]),
          nextmatch[2],
          new ObjectId(req.body[7])
        );
      }

      if (req.body[2] == 3) {
        await saveResults(
          db,
          new ObjectId(req.body[5]),
          nextmatch[2],
          new ObjectId(req.body[7])
        );
        await saveResults(
          db,
          new ObjectId(req.body[6]),
          nextmatch[1],
          new ObjectId(req.body[7])
        );
      }
    }

  //  mongoClient.close(true);
    res.status(200).json(res);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

const handleFree = async (req, res) => {
  try {
    // const mongoClient = await new MongoClient(
    //   process.env.MONGODB_URI,
    //   {useNewUrlParser: true}
    // ).connect();

    /* 
    req.body:
    [0] idmeczu
    [1] player1sets
    [2] player2sets
    [3] idgrupy
    [4] runda
    [5] player1id
    [6] player2id
    [7] idzawodów
    [8] nrmeczu
    */
    // const db = mongoClient.db("zawody");
    const collecion = db.collection("mecze");
    const free = await getFree();
    const stringFree = free.toString(); 
    let runda = req.body[4].toString();

    const nextmatch = selectRound(runda, req.body[8]);
    if(req.body[5] == stringFree ||
      req.body[6] == stringFree)
      {
        console.log("zczytało odpowienio", free)
      }
    console.log("co zawraca mecze", nextmatch);
    const human =
      req.body[5] == stringFree ? req.body[6] : req.body[5];
    console.log("human", human);

    if (
      (req.body[5] == stringFree ||
        req.body[6] == stringFree) &&
      nextmatch[0] == 1
    ) {

      await player1nextMatch(
        collecion,
        new ObjectId(req.body[7]),
        nextmatch[1],
        runda,
        new ObjectId(human)
      );
      await player1nextMatch(
        collecion,
        new ObjectId(req.body[7]),
        nextmatch[2],
        runda,
        free
      );
    }

    if (
      (req.body[5] == stringFree ||
        req.body[6] == stringFree) &&
      nextmatch[0] == 2
    ) {
      await player2nextMatch(
        collecion,
        new ObjectId(req.body[7]),
        nextmatch[1],
        runda,
        new ObjectId(human)
      );
      await player2nextMatch(
        collecion,
        new ObjectId(req.body[7]),
        nextmatch[2],
        runda,
        free
      );
    }

    if (nextmatch[0] == -1) {
      await saveResults(
        db,
        new ObjectId(human),
        nextmatch[1],
        new ObjectId(req.body[7])
      );
    }
    await collecion.findOneAndUpdate(
      {
        idzawodow: new ObjectId(req.body[7]),
        _id: new ObjectId(req.body[0]),
      },
      { $set: { saved: true } }
    );

    // mongoClient.close(true);
    res.status(200).json(res);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

const handleAdd = async (req, res) => {
  try {
    // const mongoClient = await new MongoClient(
    //   process.env.MONGODB_URI,
    //   {useNewUrlParser: true}
    // ).connect();

   const {player1sets, player2sets, player1id, player2id, rankingid} = req.query;
  
   const player1setsN = parseInt(player1sets)
   const player2setsN = parseInt(player2sets)

  console.log("b",req.body);
  console.log("q",req.query)
  console.log("kkkk", parseInt(player1sets))
    await db.collection("mecze").insertOne({
      date: new Date(),
      player1id: new ObjectId(player1id),
      player2id: new ObjectId(player2id),
      player1sets: player1setsN,
      player2sets: player2setsN,
      rankingid: new ObjectId(rankingid)
    });

    let result =[];

    if (player1setsN == 3 || player2setsN == 3) {
      const sety = player1setsN + player2setsN;

      let p1 = 0;
      let p2 = 0;

      player1setsN === 3 ? (p1 = 1) : (p2 = 1);
      console.log(sety, p1, p2);
      result = addtorankingarray(
        result,
        new ObjectId(player1id),
        sety,
        player1setsN,
        p1
      );

      result = addtorankingarray(
        result,
        new ObjectId(player2id),
        sety,
        player2setsN,
        p2
      );
    }
    console.log("tutajx")
    const collection = db2.collection("ranks");
    await Promise.all(
      result.map(async (item) => {
         console.log("Mapping..."); //
        const filter = {
          playerid: new ObjectId(item.playerid),
          rankingid: new ObjectId(rankingid),
        };
         console.log("filter",filter);
        const rank = await collection.findOne(filter);

        const field = {
          rankingid: new ObjectId(rankingid),
          playerid: item.playerid,
          sets: item.sets,
          winsets: item.winsets,
          match: item.match,
          winmatch: item.winmatch,
        };

        //   console.log("field", field);
        //   console.log("rank", rank);

        if (rank) {
          await collection.findOneAndUpdate(filter, {
            $inc: {
              sets: item.sets,
              winsets: item.winsets,
              match: item.match,
              winmatch: item.winmatch,
            },
          });
        } else {
          await collection.insertOne(field);
        }
      })
    );

   

  //  mongoClient.close(true);
    res.status(200).json(res);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

module.exports = { handleSave, handleFree, handleAdd };
