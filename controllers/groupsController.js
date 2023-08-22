const { MongoClient, ObjectId } = require("mongodb");
// import dotenv from 'dotenv';
// dotenv.config();
const uri =
  "mongodb+srv://mroczkapawel:shHRikMiMqs7gYdV@cluster0.0hcmknt.mongodb.net/?retryWrites=true&w=majority";
console.log(uri);
const options = {};

const hanldeGroups = async (req, res) => {
  const mongoClient = await new MongoClient(uri, options).connect();
  // console.log(mongoClient);
  //mongoClient.db("admin").command({ ping: 1 });
  console.log("Just Connected!");
//console.log(req.query)
  try {
    const wyn = [];
    const groupsid = [];

    const db = mongoClient.db("zawody");
    const db2 = mongoClient.db("druzyna");

    //pobranie listy zawodników
    const zawodniki = await db2.collection("zawodnik").find({}).toArray();

    //pobranie grup
    const grupy = await db
      .collection("grupy")
      .find({ idzawodow: new ObjectId(req.query.idzawodow) })
      .sort({ grupid: 1 })
      .toArray();

    //podmiana w frupacj id zawodnika na imie i nazwisko
   // console.log("grupy", grupy)
    grupy.map((grupa) => {
      groupsid.push(grupa._id);

      const newArray = grupa.zawodnicy.map((item) => {
        const zawodnik = zawodniki.find((zaw) => zaw._id.equals(item));
        return zawodnik.imie + " " + zawodnik.nazwisko;
      });
      grupa.zawodnicy = newArray;
    });

    //pobranie meczy na podstawie grupid
    const mecze = await db
      .collection("mecze")
      .find({ idgrupy: { $in: groupsid } })
      .toArray();

    mecze.map((mecz) => {
      let zawodnik = zawodniki.find((zaw) => zaw._id.equals(mecz.player1id));
      mecz.player1name = zawodnik.imie + " " + zawodnik.nazwisko;
      zawodnik = zawodniki.find((zaw) => zaw._id.equals(mecz.player2id));
      mecz.player2name = zawodnik.imie + " " + zawodnik.nazwisko;
    });

    //console.log("wyniki", grupy, mecze)
    wyn.push(grupy, mecze);
    //console.log(wyn)
    res.status(200).json(wyn);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

module.exports = { hanldeGroups };
