require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
var admin = require("firebase-admin");

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var serviceAccount = require("./admin-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ error: "Unauthorized Access" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedUser = await admin.auth().verifyIdToken(token);
    req.user = decodedUser;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Forbidden Access" });
  }
};




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2njcmuh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
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

    // Send a ping to confirm a successful connection

    const data = client.db("career_db_server")
    const userCollection = data.collection('user')
    const requestCollection = data.collection('request')

    // --------------------------------------------------------------------------------------
    // --------------------------------------------------------------------------------------------


    // when user regitered the data will be saved in mongodb user info 
    app.post('/addUser', async (req, res) => {
      const users = req.body;
      const findUser = await userCollection.findOne({ email: users.email })
      if (findUser) {
        res.send({ msg: 'user already exist' })
      }
      else {

        const result = await userCollection.insertOne(users);
        res.send(result);
      }
    });

    // when user login the data will be saved in mongodb curUser 
    app.get('/get-user-role', verifyToken, async (req, res) => {
      const user = await userCollection.findOne({ email: req.user.email })

      console.log('role is ', user.role)
      res.send(user)
    })


    app.put('/update-user/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const task = req.body
      const options = { upsert: true };
      const document = {
        $set: {
          ...task
        }
      }
      const result = await userCollection.updateOne(filter, document, options)
      res.send(result)
    })

    // add request data in mongodb 
    app.post('/add-request', async (req, res) => {
      const users = req.body;
      const result = await requestCollection.insertOne(users);
      res.send(result);

    })

    // get logged in user donation request data 
    app.get('/get-user-request', verifyToken, async (req, res) => {
      const result = await requestCollection.find({ reqEmail: req.user.email }).toArray()
      res.send(result)
    })
    // get request details
    app.get('/get-request-details/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await requestCollection.findOne(query)
      res.send(result)
    })
    app.get('/recent-request', verifyToken, async (req, res) => {
      const data = await requestCollection.find({ reqEmail: req.user.email }).sort({ createdAt: -1 }).limit(3).toArray()
      res.send(data)
    })

    app.get('/get-all-user', async (req, res) => {
      const result = await userCollection.find().toArray()
      res.send(result)
    })
    app.get('/get-all-request', async (req, res) => {
      const result = await requestCollection.find().toArray()
      res.send(result)
    })
    app.put('/updateRequest/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const task = req.body
      const options = { upsert: true };
      const document = {
        $set: {
          ...task
        }
      }
      const result = await requestCollection.updateOne(filter, document, options)
      res.send(result)
    })
    app.delete('/deleteReq/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const result = await requestCollection.deleteOne(filter)
      res.send(result)
    })
    app.patch('/statusInprogress/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: 'inprogress',

        }
      };

      const result = await requestCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    app.patch('/statusPending/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: 'pending',

        }
      };

      const result = await requestCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    // update status as done 
    app.patch('/statusDone/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: 'done',

        }
      };

      const result = await requestCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    app.patch('/statusCancel/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: 'cancel',

        }
      };
      const result = await requestCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    app.patch('/statusBlock/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: 'Blocked',

        }
      };

      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    app.patch('/statusActive/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: 'Active',

        }
      };

      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    app.patch('/roleAdmin/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin',

        }
      };

      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    app.patch('/roleVolunteer/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'volunteer',

        }
      };

      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    app.patch('/roleDonor/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'donor',

        }
      };

      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // find status inprogress  data 
    app.get('/status-inprogress', async (req, res) => {
      const result = await requestCollection.find({ status: 'inprogress' }).toArray()
      res.send(result)
    })
    app.get('/status-inprogress-recent', async (req, res) => {
      const data = await requestCollection.find({ status: 'inprogress' }).sort({ createdAt: 1 }).limit(6).toArray()
      res.send(data)
    })
    app.get('/get-pending-request', async (req, res) => {
      const result = await requestCollection.find({ status: 'pending' }).toArray()
      res.send(result)
    })
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})