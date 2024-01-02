const { ObjectId } = require("mongodb");
const database = require("../services/db");
const db = database.client.db("zawody");
const db2 = database.client.db("druzyna");

const handleRoundMatch = async (req, res) => {
  try {
    const idzawodow = req.query.idzawodow;

    const mecze = await db
      .collection("mecze")
      .find({ idzawodow: new ObjectId(idzawodow) })
      .sort({ idmeczu: 1 })
      .toArray();
    const zawodniki = await db2.collection("zawodnik").find({}).toArray();
    //podmiana id na imie i nazwisko w meczach
    mecze.map((mecz) => {
      let zawodnik = zawodniki.find((zaw) => zaw._id.equals(mecz.player1id));
      if (zawodnik) {
        mecz.player1name = zawodnik.imie + " " + zawodnik.nazwisko;
      }
      zawodnik = zawodniki.find((zaw) => zaw._id.equals(mecz.player2id));
      if (zawodnik) {
        mecz.player2name = zawodnik.imie + " " + zawodnik.nazwisko;
      }
    });

    res.status(200).json(mecze);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

module.exports = { handleRoundMatch };
