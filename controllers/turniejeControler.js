const database = require("../services/db");
const db = database.client.db("zawody");

const handleTurnieje = async (req, res) => {
  try {
    // const mongoClient = await new MongoClient(
    //   process.env.MONGODB_URI,
    //   {useNewUrlParser: true}
    // ).connect();
    // const db = mongoClient.db("zawody");
    const collection = db.collection("turnieje");
    const turnieje = await collection
      .find({})
      .sort({ _id: -1 })
      .project({ zawodnicy: 0, liczbagrup: 0 })
      .toArray();

    turnieje.map((turniej) => {
      turniej.data = ` [${turniej.dataturneju.getDate()}-${
        turniej.dataturneju.getMonth() + 1
      }]`;
    });

    // mongoClient.close(true);
    res.status(200).json(turnieje);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

module.exports = { handleTurnieje };
