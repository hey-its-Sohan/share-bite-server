
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zodydsc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const shareBitesCollection = client.db('shareBiteDB').collection('shareBite')

    // get API for all foods data
    app.get('/all-foods', async (req, res) => {
      const cursor = shareBitesCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    // featured foods API
    app.get('/featured-foods', async (req, res) => {
      const cursor = shareBitesCollection.find().limit(6);
      const result = await cursor.toArray();
      res.send(result)
    })

    // post data to MongoDB
    app.post('/add-food', async (req, res) => {
      const foodData = req.body
      const result = await shareBitesCollection.insertOne(foodData)
      res.send(result)
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Get Ready To Share Bite!')
})

app.listen(port, () => {
  console.log(`Share Bite is running on port: ${port}`)
})