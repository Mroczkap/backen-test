const { ObjectId } = require("mongodb");
const { addtorankingarray, addtopair } = require("../services/ranking");
const { sortByProperty } = require("../services/operations");
const { v4: uuidv4 } = require('uuid');

const database = require("../services/db");
const db = database.client.db("zawody");
const db2 = database.client.db("druzyna");
const db3 = database.client.db("data");

const handleAdd = async (req, res) => {
  try {
    const { idzawodow, idrankingu } = req.body;
    const ranking = await db2
      .collection("cykle")
      .find({ _id: new ObjectId(idrankingu) })
      .toArray();
    const turnieje = ranking[0].turnieje;
    const index = turnieje.indexOf(idzawodow);
    const count = turnieje.length;

    if (index !== -1) {
      res.status(203).json(res);
    }

    turnieje.push(idzawodow);

    await db2
      .collection("cykle")
      .findOneAndUpdate(
        { _id: new ObjectId(idrankingu) },
        { $set: { turnieje: turnieje, count: count } }
      );

    const collection = db.collection("wyniki");
    const wyniki = await collection
      .find({ idzawodow: new ObjectId(idzawodow) })
      .sort({ miejsce: 1 })
      .toArray();

    console.log("wyniki", wyniki);

    const points = await db3
      .collection("point")
      .find({ name: "Main" })
      .toArray();

    console.log("points", points[0].pkt);

    const zawodnicyIds = [];
    const zdobytePunkty = [];

    wyniki.forEach((result) => {
      const pointsIndex = result.miejsce;
      const pointsValue = points[0].pkt[pointsIndex];
      zawodnicyIds.push(result.idzawodnika);
      zdobytePunkty.push(pointsValue);
    });

    //console.log("zaw", zawodnicyIds)
    //console.log("zp", zdobytePunkty)

    console.log("tl", turnieje.length);
    const collection2 = db2.collection("cykl");
    const field = {
      cyklid: new ObjectId(idrankingu),
      zawodnicy: zawodnicyIds,
      setspunkty: zdobytePunkty,
      turniejid: idzawodow,
      numer: turnieje.length - 1,
    };

    await collection2.insertOne(field);

    res.status(200).json(res);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

const handleShow = async (req, res) => {
  try {
    const idrankingu = req.query.idrankingu;
    const ranking = await db2
      .collection("cykl")
      .find({ cyklid: new ObjectId(idrankingu) })
      .toArray();

    console.log("cycle", ranking);

    const zawodnicyWyniki = {};

    // Iterujemy przez każdy turniej
    ranking.forEach((turniej) => {
      const { numer, zawodnicy, setspunkty } = turniej;

      // Iterujemy przez każdego zawodnika w turnieju
      zawodnicy.forEach((idzawodnika, index) => {
        // Jeśli zawodnik nie istnieje w obiekcie zawodnicyWyniki, dodajemy go
        if (!zawodnicyWyniki[idzawodnika]) {
          zawodnicyWyniki[idzawodnika] = { id: uuidv4(), idzawodnika, sumapkt: 0 };
        }

        // Dodajemy punkty za ten turniej do odpowiedniego zawodnika
        const punkty = setspunkty[index];
        zawodnicyWyniki[idzawodnika][`z${numer}`] = punkty;
        zawodnicyWyniki[idzawodnika].sumapkt += punkty;
      });
    });

    // Konwersja obiektu zawodnicyWyniki do tablicy

    const zawodniki = await db2.collection("zawodnik").find({}).toArray();
 
   
    const wynikiArray = Object.values(zawodnicyWyniki);

    wynikiArray.map((item) => {
      const zawodnik = zawodniki.find((zaw) => zaw._id.equals(item.idzawodnika));

      item.name = zawodnik.nazwisko + " " + zawodnik.imie;
    });

    const sorted = sortByProperty(
      wynikiArray,
      "sumapkt",
      "name",
      false
    );

    console.log("w", wynikiArray);

    res.status(200).json(sorted);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

const handleList = async (req, res) => {
  try {
    const collection = db2.collection("cykle");
    const results = await collection.find({}).sort({ _id: 1 }).toArray()
    res.status(200).json(results);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

module.exports = { handleAdd, handleShow, handleList };
