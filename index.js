
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const admin = require("firebase-admin");
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const serviceAccount = require("./firebase-adminsdk.json");

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

// Firebase admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// verifyToken.js


const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // you now have uid, email, etc.
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(403).json({ message: 'Forbidden: Invalid token' });
  }
};




async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const shareBitesCollection = client.db('shareBiteDB').collection('shareBite')
    const foodRequestsCollection = client.db('shareBiteDB').collection('requestedFoods')

    // get API for all foods data
    app.get('/all-foods', async (req, res) => {
      try {
        const authHeader = req.headers.authorization;
        let userEmail = null;

        // Decode Firebase token if provided
        if (authHeader?.startsWith('Bearer ')) {
          const token = authHeader.split(' ')[1];
          const decoded = await admin.auth().verifyIdToken(token);
          userEmail = decoded.email;
        }

        let requestedIds = [];

        // If the user is logged in, get their requested food IDs
        if (userEmail) {
          const requests = await foodRequestsCollection.find({ userEmail }).toArray();
          requestedIds = requests.map(req => new ObjectId(req._id));
        }

        // Build query to exclude requested foods (if any)
        const query = {
          availability: "Available",
          ...(requestedIds.length > 0 && { _id: { $nin: requestedIds } })
        };

        const result = await shareBitesCollection.find(query).toArray();
        res.send(result);

      } catch (err) {
        console.error('Error fetching available foods:', err);
        res.status(500).send({ message: 'Internal server error' });
      }
    });


    // app.get('/all-foods', async (req, res) => {
    //   const query = { availability: 'Available' }
    //   const cursor = shareBitesCollection.find(query);
    //   const result = await cursor.toArray();
    //   res.send(result)
    // })

    // featured foods API
    app.get('/featured-foods', async (req, res) => {
      const query = { availability: 'Available' }
      const cursor = shareBitesCollection.find(query).sort({ quantity: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result)
    })

    // food details API
    app.get('/food-details/:id', async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) }
      const result = await shareBitesCollection.findOne(query)
      res.send(result)
    })

    // my foods API
    app.get('/my-foods', verifyToken, async (req, res) => {
      const query = { email: req.user.email }
      const result = await shareBitesCollection.find(query).toArray();
      res.send(result)
    })

    // my requested food list API
    app.get('/my-requests', verifyToken, async (req, res) => {
      const query = { userEmail: req.user.email }
      const result = await foodRequestsCollection.find(query).toArray();
      res.send(result)
    })

    // post data to MongoDB
    app.post('/add-food', async (req, res) => {
      const foodData = req.body
      const result = await shareBitesCollection.insertOne(foodData)
      res.send(result)
    })



    // post food request
    app.post('/requested-food', verifyToken, async (req, res) => {
      const data = req.body
      const result = await foodRequestsCollection.insertOne(data);
      res.send(result)
    })

    // Update food availability
    // app.patch('/update-availability/:id', verifyToken, async (req, res) => {
    //   const query = { _id: new ObjectId(req.params.id) }
    //   const update = {
    //     $set: {
    //       availability: req.body.availability,
    //       notes: req.body.notes
    //     }
    //   };
    //   const result = await shareBitesCollection.updateOne(query, update)
    //   res.send(result)
    // })

    app.put('/update-food/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const updatedFood = req.body
      const updatedDoc = {
        $set: updatedFood
      }
      const result = await roommatesCollection.updateOne(filter, updatedDoc)
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