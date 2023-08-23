const { MongoClient } = require("mongodb");

const handleZawodnicy = async (req, res) => {
  try {
    const mongoClient = await new MongoClient(
      process.env.MONGODB_URI,
      {}
    ).connect();
    const db = mongoClient.db("druzyna");
    const collection = db.collection("zawodnik");
    const results = await collection
      .find({ usuniety: false })
      .sort({ ranking: -1 })
      .toArray();

    res.status(200).json(results);
    mongoClient.close();
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

module.exports = { handleZawodnicy };
