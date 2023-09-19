
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors')
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

// middleware

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.BD_PASS}@cluster0.hncbqqn.mongodb.net/?retryWrites=true&w=majority`;

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
    //await client.connect();

    const toyGalleryCollection = client.db("ToyStore").collection("galley2")

    const addToyCollection = client.db('ToyStore').collection('newToys')

    const addToyCollectionReview = client.db('ToyStore').collection('toysReview')





    // get all gallery data
    app.get('/gallery', async (req, res) => {
      const cursor = toyGalleryCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    
    // added data in server
    app.post('/addToys', async (req, res) => {
      const addToy = req.body;
      console.log(addToy);
      const result = await addToyCollection.insertOne({...addToy, price: parseFloat(addToy.price)})
      res.send(result);
    })



    //post toy review
    app.post('/addToysReview', async (req, res) => {
      const addToyReview = req.body;
      // console.log(addToyReview);
      const result = await addToyCollectionReview.insertOne(addToyReview)
      res.send(result);
    })


    //get all data form server to client

    app.get('/allToys', async (req, res) => {
      const limit = parseInt(req.query.limit) || 20;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * limit;
      const cursor = addToyCollection.find().limit(limit).skip(skip);
      const result = await cursor.toArray()
      res.send(result);
    })

    // get all toy review 
    app.get('/allToysReview', async (req, res) => {
      const cursor = addToyCollectionReview.find();
      const result = await cursor.toArray()
      res.send(result);
    })

    // get category data 
    app.get("/allToysByCategory/:category", async (req, res) => {
      // console.log(req.params.category);
      const result = await addToyCollection.find({
        category: req.params.category
      }).limit(2).toArray();
      res.send(result)
    });




    // accending by price
    app.get("/ascending", async (req, res) => {
      const email = req.query.email;
      const filter = { email: email };
      const result = await addToyCollection
        .find(filter)
        .sort({ price: 1 })
        .toArray();
      res.send(result);
    });

  
    app.get("/descending", async (req, res) => {
      const email = req.query.email;
      const filter = { email: email };
      const result = await addToyCollection
        .find(filter)
        .sort({ price: -1 })
        .toArray();
      res.send(result);
    });




    //get each person added item by email
    app.get('/myToys/:email', async (req, res) => {
      const result = await addToyCollection.find({
        email: req.params.email
      }).toArray();
      res.send(result)
    })


    // get data by specif id
    app.get('/singleToy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await addToyCollection.findOne(query)
      res.send(result)
    });


    //delete an item form client delete;
    app.delete('/deleteToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await addToyCollection.deleteOne(query);
      res.send(result);
    });

    // search Implement a search system 
    app.get('/toySearchByToyName/:text', async (req, res) => {
      const searchText = req.params.text;
      console.log(searchText);

      const result = await addToyCollection.find({
        $or: [
          { name: { $regex: searchText, $options: 'i' } }
        ]
      }).toArray()

      res.send(result)
    })

    // update toys info

    app.put(('/updateToy/:id'), async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          price: body.price,
          quantity: body.quantity,
          description: body.description
        }
      }
      const result = await addToyCollection.updateOne(filter, updateDoc)
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
  res.send("Server is running")
})

app.listen(port, () => {
  console.log(`Server is running on port : ${port}`);
})