
const { MongoClient } = require( "mongodb");
// import dotenv from 'dotenv';
// dotenv.config();
const uri =
  "mongodb+srv://mroczkapawel:shHRikMiMqs7gYdV@cluster0.0hcmknt.mongodb.net/?retryWrites=true&w=majority";
console.log(uri);
const options = {};






const handleTurnieje = async (req, res) => {
  const mongoClient = await new MongoClient(uri, options).connect();

   
   
        console.log("turniejebacken", req.query);
        try {
          const db = mongoClient.db("zawody");
          const collection = db.collection("turnieje");
          const turnieje = await collection
            .find({})
            .sort({ _id: -1 })
            .project({ zawodnicy: 0, liczbagrup: 0 })
            .toArray();
      
          res.status(200).json(turnieje);
        } catch (e) {
          res.send("Somethnig went wrong");
        }
     
}

module.exports = { handleTurnieje }