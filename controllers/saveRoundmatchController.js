const {ObjectId } = require("mongodb");

const database = require("../services/db");
const db = database.client.db('zawody')

const {
  player1nextMatch,
  player2nextMatch,
  saveResults,
  selectRound,
} = require("../services/nextMatch");

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

    let runda = req.body[4].toString();

    const nextmatch = selectRound(runda, req.body[8]);

    console.log("co zawraca mecze", nextmatch);
    const human =
      req.body[5] == "64d6154e509bb85987990033" ? req.body[6] : req.body[5];
    console.log("human", human);

    if (
      (req.body[5] == "64d6154e509bb85987990033" ||
        req.body[6] == "64d6154e509bb85987990033") &&
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
        new ObjectId("64d6154e509bb85987990033")
      );
    }

    if (
      (req.body[5] == "64d6154e509bb85987990033" ||
        req.body[6] == "64d6154e509bb85987990033") &&
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
        new ObjectId("64d6154e509bb85987990033")
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

module.exports = { handleSave, handleFree };
