const { MongoClient, ObjectId } = require("mongodb");
// import dotenv from 'dotenv';
// dotenv.config();
const uri =
  "mongodb+srv://mroczkapawel:shHRikMiMqs7gYdV@cluster0.0hcmknt.mongodb.net/?retryWrites=true&w=majority";
console.log(uri);
const options = {};

const handleZawodnicy = async (req, res) => {
  const mongoClient = await new MongoClient(uri, options).connect();
  // console.log(mongoClient);
  //mongoClient.db("admin").command({ ping: 1 });
  console.log("Just Connected!");
  try {
   
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    console.log("Just Connected!");
    const db = mongoClient.db("druzyna");
    const collection = db.collection("zawodnik");

    //console.log(collection);
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
