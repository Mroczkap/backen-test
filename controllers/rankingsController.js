const { ObjectId } = require("mongodb");
const { addtorankingarray } = require("../services/ranking");
const {sortByProperty} = require ("../services/operations")

const database = require("../services/db");
const db = database.client.db('zawody')
const db2 = database.client.db('druzyna')

const handleAdd = async (req, res) => {
  try {
    // const mongoClient = await new MongoClient(process.env.MONGODB_URI, {
    //   useNewUrlParser: true,
    // }).connect();
    const { idzawodow, idrankingu } = req.body;
    //onsole.log("id rankingu", idrankingu)
    // const db2 = mongoClient.db("druzyna");

    const ranking = await db2
      .collection("rankingi")
      .find({ _id: new ObjectId(idrankingu) })
      .toArray();
   // console.log("rankign", ranking)
    const turnieje = ranking[0].turnieje;
  //  console.log("turnije", turnieje)
    const index = turnieje.indexOf(idzawodow);

    if (index !== -1) {
      res.status(203).json(res);
    }

    turnieje.push(idzawodow);

    console.log("ttt", turnieje)
    await db2
      .collection("rankingi")
      .findOneAndUpdate({ _id: new ObjectId(idrankingu) }, {$set: {turnieje: turnieje}});
    

    console.log("jednak poszedłem");
    // const db = mongoClient.db("zawody");
    const mecze = await db
      .collection("mecze")
      .find({ idzawodow: new ObjectId(idzawodow) })
      .toArray();

    let result = [];
    //console.log(mecze);

    mecze.map((mecz) => {
      const sety = mecz.player1sets + mecz.player2sets;

      let p1 = 0;
      let p2 = 0;

      mecz.player1sets === 3 ? (p1 = 1) : (p2 = 1);
      //console.log(sety, p1, p2);
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
    });

    const collection = db2.collection("ranks");
    await Promise.all(
      result.map(async (item) => {
      //  console.log("Mapping..."); //
        const filter = {
          playerid: new ObjectId(item.playerid),
          rankingid: new ObjectId(idrankingu),
        };
       // console.log(filter);
        const rank = await collection.findOne(filter);

        const field = {
          rankingid: new ObjectId(idrankingu),
          playerid: item.playerid,
          sets: item.sets,
          winsets: item.winsets,
          match: item.match,
          winmatch: item.winmatch,
          tournaments: 1
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
              tournaments: 1
            },
          });
        } else {
          await collection.insertOne(field);
        }
      })
    );

   // console.log("ranking", result);

    res.status(200).json(res);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

const handleShow = async (req, res) => {
  try {
    // const mongoClient = await new MongoClient(process.env.MONGODB_URI, {
    //   useNewUrlParser: true,
    // }).connect();
    const idrankingu  = req.query.idrankingu;
  //  console.log("id rankingu", idrankingu)
    
    // const db = mongoClient.db("druzyna");
    const zawodniki = await db2.collection("zawodnik").find({}).toArray();

    

    const ranking = await db2
      .collection("ranks")
      .find({ rankingid: new ObjectId(idrankingu) })
      .toArray();
   // console.log("rankign", ranking)
    let index =1;
    ranking.map((item)=> {


      const zawodnik = zawodniki.find((zaw) => zaw._id.equals(item.playerid));
      item.name =  zawodnik.nazwisko + " " + zawodnik.imie;
      item.id = index;
      index++;
      item.setspercent =  item.winsets/item.sets;
      item.matchpercent = item.winmatch/item.match;
    })

    const sorted = sortByProperty(ranking, 'matchpercent', 'setspercent', false);
    res.status(200).json(sorted);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

const handleList = async (req, res) => {
  try {
    const collection = db2.collection("rankingi");
    const results = await collection
      .find({ })
      .sort({ _id: 1})
      .toArray();
    console.log("hmm", results)
    res.status(200).json(results);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

module.exports = { handleAdd, handleShow,handleList };
