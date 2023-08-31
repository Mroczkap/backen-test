const { MongoClient, ObjectId } = require("mongodb");

const getAllZawodnicy = async (req, res) => {
  try {
    const mongoClient = await new MongoClient(
      process.env.MONGODB_URI,
      {useNewUrlParser: true}
    ).connect();
    const db = mongoClient.db("druzyna");
    const collection = db.collection("zawodnik");
    const results = await collection
      .find({ usuniety: false })
      .sort({ ranking: -1 })
      .toArray();

    res.status(200).json(results);
    mongoClient.close(true);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

const createNewZawodnik = async (req, res) => {
  try {
    const mongoClient = await new MongoClient(
      process.env.MONGODB_URI,
      {useNewUrlParser: true}
    ).connect();
    const db = mongoClient.db("druzyna");

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

    mongoClient.close(true);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

const updateZawodnik = async (req, res) => {
  try {
    const mongoClient = await new MongoClient(
      process.env.MONGODB_URI,
      {useNewUrlParser: true}
    ).connect();
    const db = mongoClient.db("druzyna");

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
    mongoClient.close(true);
    res.status(200).json(res);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

const deleteZawodnik = async (req, res) => {
  try {
    const mongoClient = await new MongoClient(
      process.env.MONGODB_URI,
      {useNewUrlParser: true}
    ).connect();
    const db = mongoClient.db("druzyna");
    let id = req.query.id;
    await db
      .collection("zawodnik")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { usuniety: true } }
      );
    mongoClient.close(true);
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
