const { ObjectId } = require("mongodb");
const database = require("../services/db");
const db = database.client.db("druzyna");

const getAllZawodnicy = async (req, res) => {
  try {
    const collection = db.collection("zawodnik");

    let sorting = {};

    if (req.query.sorting) {
      sorting = { nazwisko: 1 };
    } else {
      sorting = { ranking: -1 };
    }
    const results = await collection
      .find({ usuniety: false })
      .sort(sorting)
      .toArray();

    res.status(200).json(results);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

const createNewZawodnik = async (req, res) => {
  try {
    await db.collection("zawodnik").insertOne({
      imie: req.body.firstname,
      nazwisko: req.body.secondname,
      plec: req.body.gender,
      wiek: parseInt(req.body.old),
      okladziny: req.body.palete,
      ranking: parseInt(req.body.ranking),
      usuniety: false,
    });
    res.status(200).json(res);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

const updateZawodnik = async (req, res) => {
  try {
    await db.collection("zawodnik").findOneAndUpdate(
      { _id: new ObjectId(req.query.id) },
      {
        $set: {
          imie: req.body.firstname,
          nazwisko: req.body.secondname,
          plec: req.body.gender,
          wiek: parseInt(req.body.old),
          okladziny: req.body.palete,
          ranking: parseInt(req.body.ranking),
        },
      }
    );
    res.status(200).json(res);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

const deleteZawodnik = async (req, res) => {
  try {
    let id = req.query.id;
    await db
      .collection("zawodnik")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { usuniety: true } }
      );
    res.status(203).json(res);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

module.exports = {
  getAllZawodnicy,
  createNewZawodnik,
  updateZawodnik,
  deleteZawodnik,
};
