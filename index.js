const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// middleware

app.use(cors());
app.use(express.json());
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.BD_PASS}@cluster0.hncbqqn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const toyGalleryCollection = client.db("ToyStore").collection("galley2");

    const addToyCollection = client.db("ToyStore").collection("newToys");

    const addToyCollectionReview = client
      .db("ToyStore")
      .collection("toysReview");

    // get all gallery data
    app.get("/gallery", async (req, res, next) => {
      try {
        const result = await toyGalleryCollection.find().toArray();
        res.send(result);
      } catch (error) {
        next(error);
      }
    });

    // added data in server
    app.post("/addToys", async (req, res, next) => {
      try {
        const addToy = req.body;
        console.log(addToy);
        const result = await addToyCollection.insertOne({
          ...addToy,
          price: parseFloat(addToy.price),
        });
        res.send(result);
      } catch (error) {
        next(error);
      }
    });

    //post toy review
    app.post("/addToysReview", async (req, res, next) => {
      try {
        const addToyReview = req.body;
        // console.log(addToyReview);
        const result = await addToyCollectionReview.insertOne(addToyReview);
        res.send(result);
      } catch (error) {
        next(error);
      }
    });

    //get all data form server to client

    app.get("/allToys", async (req, res, next) => {
      try {
        const limit = parseInt(req.query.limit) || 20;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;
        const cursor = addToyCollection.find().limit(limit).skip(skip);
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        next(error);
      }
    });

    // get all toy review
    app.get("/allToysReview", async (req, res, next) => {
      try {
        const result = await addToyCollectionReview.find().toArray();
        res.send(result);
      } catch (error) {
        next(error);
      }
    });

    // get category data
    app.get("/allToysByCategory/:category", async (req, res, next) => {
      // console.log(req.params.category);
      try {
        const result = await addToyCollection
          .find({
            category: req.params.category,
          })
          .limit(2)
          .toArray();
        res.send(result);
      } catch (error) {
        next(error);
      }
    });

    // accending by price
    app.get("/ascending", async (req, res, next) => {
      try {
        const email = req.query.email;
        const filter = { email: email };
        const result = await addToyCollection
          .find(filter)
          .sort({ price: 1 })
          .toArray();
        res.send(result);
      } catch (error) {
        next(error);
      }
    });

    app.get("/descending", async (req, res, next) => {
      try {
        const email = req.query.email;
        const filter = { email: email };
        const result = await addToyCollection
          .find(filter)
          .sort({ price: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        next(error);
      }
    });

    //get each person added item by email
    app.get("/myToys/:email", async (req, res, next) => {
      try {
        const result = await addToyCollection
          .find({
            email: req.params.email,
          })
          .toArray();
        res.send(result);
      } catch (error) {
        next(error);
      }
    });

    // get data by specif id
    app.get("/singleToy/:id", async (req, res, next) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await addToyCollection.findOne(query);
        res.send(result);
      } catch (error) {
        next(error);
      }
    });

    //delete an item form client delete;
    app.delete("/deleteToys/:id", async (req, res, next) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await addToyCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        next(error);
      }
    });

    // search Implement a search system
    app.get("/toySearchByToyName/:text", async (req, res, next) => {
      try {
        const searchText = req.params.text;
        // console.log(searchText);

        const result = await addToyCollection
          .find({
            $or: [{ name: { $regex: searchText, $options: "i" } }],
          })
          .toArray();

        res.send(result);
      } catch (error) {
        next(error);
      }
    });

    // update toys info

    app.put("/updateToy/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const body = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            price: body.price,
            quantity: body.quantity,
            description: body.description,
          },
        };
        const result = await addToyCollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        next(error);
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port : ${port}`);
});
