const { ObjectId } = require("mongodb");
require("dotenv").config();
const database = require("../services/db");
const db = database.client.db("zawody");
const db2 = database.client.db("druzyna");
const { addtorankingarray } = require("../services/ranking");
const { daysInWeek } = require("date-fns");

const handleAdd = async (req, res) => {
  try {
    console.log("połesz");
    const { player1sets, player2sets, player1id, player2id, rankingid } =
      req.body.params;

    console.log("b", req.body);

    console.log("kkkk", player1sets);
    await db.collection("mecze").insertOne({
      date: new Date(),
      player1id: new ObjectId(player1id),
      player2id: new ObjectId(player2id),
      player1sets: player1sets,
      player2sets: player2sets,
      rankingid: new ObjectId(rankingid),
    });

    let result = [];

    if (player1sets == 3 || player2sets == 3) {
      const sety = player1sets + player2sets;

      let p1 = 0;
      let p2 = 0;

      player1sets === 3 ? (p1 = 1) : (p2 = 1);
      console.log(sety, p1, p2);
      result = addtorankingarray(
        result,
        new ObjectId(player1id),
        sety,
        player1sets,
        p1
      );

      result = addtorankingarray(
        result,
        new ObjectId(player2id),
        sety,
        player2sets,
        p2
      );
    }
    console.log("tutajx", result);
    const collection = db2.collection("ranks");
    await Promise.all(
      result.map(async (item) => {
        console.log("Mapping..."); //
        const filter = {
          playerid: new ObjectId(item.playerid),
          rankingid: new ObjectId(rankingid),
        };
        console.log("filter", filter);
        const rank = await collection.findOne(filter);

        const field = {
          rankingid: new ObjectId(rankingid),
          playerid: item.playerid,
          sets: item.sets,
          winsets: item.winsets,
          match: item.match,
          winmatch: item.winmatch,
        };

      

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
const handleShow = async (req, res) => {
  try {

    console.log(req.query)
    const date = req.query.date;
    console.log("data",date)
    const startDate = new Date(date);// Define your start date
    const endDate = new Date(date);
    console.log(startDate.getDate())
    endDate.setDate(endDate.getDate() + 1)
    console.log(startDate)
    console.log(endDate)

    const zawodniki = await db2.collection("zawodnik").find({}).toArray();

    const mecze = await db
      .collection("mecze")
      .find({
        $and: [
          { date: { $gte: startDate } }, // Greater than or equal to startDate
          { date: { $lte: endDate } }, // Less than or equal to endDate
        ],
      })
      .sort({ date: 1 })
      .toArray();

      mecze.map((mecz) => {
        let zawodnik = zawodniki.find((zaw) => zaw._id.equals(mecz.player1id));
        mecz.player1name = zawodnik.imie + " " + zawodnik.nazwisko;
        zawodnik = zawodniki.find((zaw) => zaw._id.equals(mecz.player2id));
        mecz.player2name = zawodnik.imie + " " + zawodnik.nazwisko;
      });

     
      res.status(200).json(mecze);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

module.exports = { handleShow, handleAdd };
