const { ObjectId } = require("mongodb");
const database = require("../services/db");
const db = database.client.db("zawody");
const db2 = database.client.db("druzyna");

const hanldeGroups = async (req, res) => {
  try {
    const wyn = [];
    const groupsid = [];

    //pobranie listy zawodników
    const zawodniki = await db2.collection("zawodnik").find({}).toArray();

    //pobranie grup dla danych zawodów
    const grupy = await db
      .collection("grupy")
      .find({ idzawodow: new ObjectId(req.query.idzawodow) })
      .sort({ grupid: 1 })
      .toArray();

    //podmiana w grupach id zawodnika na imie i nazwisko
    grupy.map((grupa) => {
      groupsid.push(grupa._id);
      const newArray = grupa.zawodnicy.map((item) => {
        const zawodnik = zawodniki.find((zaw) => zaw._id.equals(item));
        return zawodnik.imie + " " + zawodnik.nazwisko;
      });
      grupa.zawodnicy = newArray;
    });

    //pobranie meczy grupowych na podstawie grupid
    const mecze = await db
      .collection("mecze")
      .find({ idgrupy: { $in: groupsid } })
      .toArray();

    //podmiana w meczach id zawodnika na imie i nazwisko
    mecze.map((mecz) => {
      let zawodnik = zawodniki.find((zaw) => zaw._id.equals(mecz.player1id));
      mecz.player1name = zawodnik.imie + " " + zawodnik.nazwisko;
      zawodnik = zawodniki.find((zaw) => zaw._id.equals(mecz.player2id));
      mecz.player2name = zawodnik.imie + " " + zawodnik.nazwisko;
    });

    wyn.push(grupy, mecze);
    res.status(200).json(wyn);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

module.exports = { hanldeGroups };
