const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

// Connection URL and Database Name
const url = 'mongodb+srv://BahayParesDB:chkBX4BzDXvScktM@cluster0.dzsyavl.mongodb.net/'; // Replace with your MongoDB connection URL
const dbName = 'BahayParesDB'; // Replace with your database name
const collectionName = 'UserAccounts'; // Replace with your collection name

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

let db;

async function connectToDatabase() {
  const client = await MongoClient.connect(url, { useUnifiedTopology: true });
  db = client.db(dbName);
}

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/register.html'));
});

app.get('/menu', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/menu.html'));
});

app.get('/ContactUs', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/ContactUs.html'));
});

app.get('/AboutUs', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/AboutUs.html'));
});

app.get('/accounts', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/accounts.html'));
});

app.get('/transactionpage.html', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/transactionpage.html'));
});

app.get('/Vieworder', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/ViewOrderStatus.html'));
});

app.get('/Updateorder', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/UpdateOrderStatus.html'));
});

// Insert route
app.post('/insert', async (req, res) => {
  const { username, email, password} = req.body;
  console.log('Received request body:', req.body);

  try {
    if (!db) {
      console.log('Database connection is not established yet.');
      return res.status(500).json({ error: 'Database connection is not ready.' });
    }

    await db.collection(collectionName).insertOne({
      username,
      email,
      password
    });

    console.log('Record inserted successfully!');
    res.status(201).json({ message: 'Record inserted successfully!' });
  } catch (err) {
    if (err.name === 'MongoError' && err.code === 11000) {
      console.log('Duplicate entry for email:', email);
      return res.status(400).json({ error: 'The provided email already exists.' });
    }

    console.error('Error inserting record:', err);
    res.status(500).json({ error: 'An error occurred while inserting the record.' });
  }
});

// Search route for login validation
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!db) {
      console.log('Database connection is not established yet.');
      return res.status(500).json({ error: 'Database connection is not ready.' });
    }

    const myaccount = await db.collection(collectionName).findOne({ username });

    if (myaccount) {
      if (myaccount.password === password) {
        console.log('Login successful:', myaccount);
        res.status(200).json({ message: 'Login successful', user: myaccount });
      } else {
        console.log('Incorrect password for the provided username.');
        res.status(401).json({ error: 'Incorrect password' });
      }
    } else {
      console.log('No account found with the provided username.');
      res.status(404).json({ error: 'No account found with the provided username.' });
    }
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'An error occurred during login.' });
  }
});


/* Update route */
app.post('/update', async (req, res) => {
  const { orderid, totalprice, location, deliverystatus } = req.body;

  try {
    if (!db) {
      console.log('Database connection is not established yet.');
      return res.status(500).json({ error: 'Database connection is not ready.' });
    }

    const updateQuery = { orderid };
    const updateValues = { $set: { totalprice, location, deliverystatus } };

    const result = await db.collection('OrderStatus').updateOne(updateQuery, updateValues);

    if (result.matchedCount > 0) {
      console.log('Document updated successfully.');
      res.status(200).json({ message: 'Document updated successfully!' });
    } else {
      console.log('No document found with the provided orderid.');
      res.status(404).json({ error: 'No document found with the provided orderid.' });
    }
  } catch (err) {
    console.error('Error updating document:', err);
    res.status(500).json({ error: 'An error occurred while updating the document.' });
  }
});

// Insert route
app.post('/insertcomments', async (req, res) => {
  const { fname, lname, email, message} = req.body;
  console.log('Received request body:', req.body);

  try {
    if (!db) {
      console.log('Database connection is not established yet.');
      return res.status(500).json({ error: 'Database connection is not ready.' });
    }

    await db.collection('CustomerFeedback').insertOne({
      fname, 
      lname, 
      email, 
      message
    });

    console.log('Feeback messaged successfully!');
    res.status(201).json({ message: 'Feeback messaged successfully!' });
  } catch (err) {
    console.error('Error inserting record:', err);
    res.status(500).json({ error: 'An error occurred while inserting the record.' });
  }
});

app.get('/admin', async (req, res) => {
  try {
    const client = await MongoClient.connect('mongodb+srv://BahayParesDB:chkBX4BzDXvScktM@cluster0.dzsyavl.mongodb.net/', options);
    const db = client.db();
    const collection = db.collection('UserAccounts');

    // Fetch data from MongoDB
    const data = await collection.find({}).toArray();

    // Send the data as JSON response
    res.json(data);

    // Remember to close the MongoDB connection
    client.close();
  } catch (err) {
    console.error('Error fetching data from MongoDB:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/adminfetch', async (req, res) => {
  try {
    const client = await MongoClient.connect('mongodb+srv://BahayParesDB:chkBX4BzDXvScktM@cluster0.dzsyavl.mongodb.net/', options);
    const db = client.db();
    const collection = db.collection('CustomerOrders');

    // Fetch data from MongoDB
    const data = await collection.find({}).toArray();

    // Send the data as JSON response
    res.json(data);

    // Remember to close the MongoDB connection
    client.close();
  } catch (err) {
    console.error('Error fetching data from MongoDB:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/latestOrder', async (req, res) => {
  try {
    // Ensure the database connection is established before searching
    if (!db) {
      console.log('Database connection is not established yet.');
      return res.status(500).json({ error: 'Database connection is not ready.' });
    }

    // Search for the most recent order using the _id field (assuming _id is an auto-generated ObjectId field)
    const latestOrder = await db.collection('CustomerOrders').findOne({}, { sort: { _id: -1 } });

    if (latestOrder) {
      console.log('Latest order found:', latestOrder);
      res.status(200).json(latestOrder);
    } else {
      console.log('No orders found in the CustomerOrders collection.');
      res.status(404).json({ error: 'No orders found in the CustomerOrders collection.' });
    }
  } catch (err) {
    console.error('Error fetching latest order:', err);
    res.status(500).json({ error: 'An error occurred while fetching the latest order.' });
  }
});

app.delete('/deleteOrder/:orderId', async (req, res) => {
  const { orderId } = req.params;

  try {
    if (!db) {
      console.log('Database connection is not established yet.');
      return res.status(500).json({ error: 'Database connection is not ready.' });
    }

    // Delete the order from MongoDB
    const result = await db.collection('CustomerOrders').deleteOne({ orderId });

    if (result.deletedCount === 0) {
      console.log('No order found with the provided orderId.');
      return res.status(404).json({ error: 'No order found with the provided orderId.' });
    }

    console.log('Order deleted successfully.');
    res.status(200).json({ message: 'Order deleted successfully.' });
  } catch (err) {
    console.error('Error deleting order from MongoDB:', err);
    res.status(500).json({ error: 'An error occurred while deleting the order.' });
  }
});

/* Delete route */
app.post('/delete', async (req, res) => {
  const { username } = req.body;

  try {
    // Ensure the database connection is established before deleting
    if (!db) {
      console.log('Database connection is not established yet.');
      return res.status(500).json({ error: 'Database connection is not ready.' });
    }

    // Construct the delete query
    const deleteQuery = { username };

    // Delete the document from the personal_info collection
    const result = await db.collection('UserAccounts').deleteOne(deleteQuery);

    if (result.deletedCount > 0) {
      console.log('Document deleted successfully.');
      res.status(200).json({ message: 'Document deleted successfully!' });
    } else {
      console.log('No document found with the provided username.');
      res.status(404).json({ error: 'No document found with the provided username.' });
    }
  } catch (err) {
    console.error('Error deleting document:', err);
    res.status(500).json({ error: 'An error occurred while deleting the document.' });
  }
});

app.post('/confirmOrder', async (req, res) => {
  const { orderId, cartItems } = req.body;

  try {
    // Ensure the database connection is established before saving the data
    if (!db) {
      console.log('Database connection is not established yet.');
      return res.status(500).json({ error: 'Database connection is not ready.' });
    }

    // Save the orderId and cartItems as a single document in MongoDB
    const result = await db.collection('CustomerOrders').insertOne({ orderId, cartItems });

    console.log('Order data saved to MongoDB:', result.insertedId);

    // Send a success response to the client
    res.status(200).json("Order confirmed proceeding to transaction");
  } catch (err) {
    console.error('Error saving order data to MongoDB:', err);
    res.status(500).json("An error occurred while ordering");
  }
});


app.get('/ordersearch', async (req, res) => {
  const { orderid } = req.query;

  try {
    // Ensure the database connection is established before searching
    if (!db) {
      console.log('Database connection is not established yet.');
      return res.status(500).json({ error: 'Database connection is not ready.' });
    }

    // Search for the student record with the provided id
    const OrderStatus = await db.collection('OrderStatus').findOne({ orderid });

    if (OrderStatus) {
      console.log('Order found:', OrderStatus);
      res.status(200).json(OrderStatus);
    } else {
      console.log('No Order found with the provided orderid.');
      res.status(404).json({ error: 'No Order found with the provided Order ID.' });
    }
  } catch (err) {
    console.error('Error searching for Order:', err);
    res.status(500).json({ error: 'An error occurred while searching for the Order.' });
  }
});

const cN = 'CustomerOrders'; // Replace with your collection name

async function connectToDatabase() {
  const client = await MongoClient.connect(url, { useUnifiedTopology: true });
  db = client.db(dbName);
}

app.post('/storeOrder', async (req, res) => {
  const { orderid, totalprice, location, deliverystatus } = req.body;

  try {
    // Ensure the database connection is established before storing the data
    if (!db) {
      console.log('Database connection is not established yet.');
      return res.status(500).json({ error: 'Database connection is not ready.' });
    }

    // Save the order details as a single document in MongoDB
    const result = await db.collection('OrderStatus').insertOne({
      orderid,
      totalprice,
      location,
      deliverystatus,
    });

    console.log('Order data saved to MongoDB:', result.insertedId);

    // Send the Order ID as a response to the client
    res.status(200).json({ orderid: result.insertedId });
  } catch (err) {
    console.error('Error storing order data to MongoDB:', err);
    res.status(500).json("An error occurred while storing the order data.");
  }
});

// Start the server and connect to the database
connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });
