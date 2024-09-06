const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config();

module.exports = {
    client: client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 }),
    connectToDB: async () => {
        try {
            await client.connect()
            console.log('Connected to MongoDB');
        } catch (err) {
            console.error('Failed to connect to MongoDB:', erroerrerrr);
        }

    }
}