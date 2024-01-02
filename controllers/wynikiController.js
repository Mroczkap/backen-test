const { ObjectId } = require("mongodb");
const database = require("../services/db");
const db = database.client.db("zawody");
const db2 = database.client.db("druzyna");

const handleWyniki = async (req, res) => {
  try {
    const collection = db.collection("wyniki");
    const wyniki = await collection
      .find({ idzawodow: new ObjectId(req.query.idzawodow) })
      .sort({ miejsce: 1 })
      .toArray();
    const zawodniki = await db2.collection("zawodnik").find({}).toArray();
    wyniki.map((wynik) => {
      let zawodnik = zawodniki.find((zaw) => zaw._id.equals(wynik.idzawodnika));

      if (zawodnik) {
        wynik.imie = zawodnik.imie;
        wynik.nazwisko = zawodnik.nazwisko;
      }
    });
    res.status(200).json(wyniki);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

module.exports = { handleWyniki };
