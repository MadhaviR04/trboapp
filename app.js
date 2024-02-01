import express from 'express';
import bodyParser from 'body-parser';
import csvParser from 'csv-parser';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const app = express();
const port = 3000;
app.set('view engine', 'ejs'); // Set EJS as the view engine
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.set('views', __dirname + '/views');

// To store Product List
let products = [];

if(products.length == 0){    // Checks if products are alreay imported, if not imports 

  app.use(bodyParser.json());

    fs.createReadStream("./italian_restaurant.csv")
      .pipe(csvParser())
      .on('data', (row) => {
        row.updatedTimeStamp = new Date().toISOString();
        products.push(row);
      })
    .on('end', () => {
      console.log('Product feed imported successfully' );
    })
    .on('error', (error) => {
      console.error('Error during CSV parsing:', error.message);
    });
}

//Import Product List API

app.post('/import', (req, res) => {

  const { file } = req.body;

  if (!file) {
    return res.status(400).json({ error: 'No product feed provided' });
  }

  fs.createReadStream(file)
    .pipe(csvParser())
    .on('data', (row) => {
      //Importing Title, Description, Category, Price, Diet, Stock
      const { title, explanation, category, price, diet, stock } = row;
      row.updatedTimeStamp = new Date().toISOString();
      products.push({ title, explanation, category, price, diet, stock });
    })
    .on('end', () => {
      res.status(200).json({ message: 'Product feed imported successfully' });
    })
    .on('error', (error) => {
      console.error('Error during CSV parsing:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    });
});


// List products 

app.get('/products', (req, res) => {

  // Implement filtering and ordering logic here based on query parameters
  const { sortBy, sortOrder, filterByName, filterByStock , filterByDiet, minPrice, maxPrice } = req.query;

  //Flitering Logic By Title, Stock, Price,Diet(Since SKU is not given, using Diet as SKU)
  let filteredProducts = [...products];

  if(filterByName){
       filteredProducts = filteredProducts.filter(product => product.title.toLowerCase().replace(/ +/g, "").includes(filterByName.toLowerCase().replace(/ +/g, "")));
  }

  if(filterByStock){
       filteredProducts = filteredProducts.filter(product => product.stock.toLowerCase().replace(/ +/g, "").includes(filterByStock.toLowerCase().replace(/ +/g, "")));
  }

 if(filterByDiet){
       filteredProducts = filteredProducts.filter(product => product.diet.toLowerCase().replace(/ +/g, "").includes(filterByDiet.toLowerCase().replace(/ +/g, "")));
  }

  if(minPrice && maxPrice){
      filteredProducts = products.filter(product => {
        const productPrice = parseFloat(product.price);
        return (productPrice >= parseFloat(minPrice)) && ( productPrice <= parseFloat(maxPrice));
      });
  }

  // sorting 
  if (sortBy && sortOrder) {

    filteredProducts.sort((a, b) => {
      return sortOrder === 'asc' ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
    });

  }
 
  res.render('products', { filteredProducts: filteredProducts, title:'Product List' });
  //res.status(200).json(filteredProducts);
});

// Sell products 

app.post('/sell', (req, res) => {
  
  const { order } = req.body;
  // logic to update stock levels based on the order id

  for (const [id, quantity] of Object.entries(order)) {
    const product = products.find((p) => p.id === id);

    if (product) {
      //product.quantity -= quantity; // Logic to update 'quantity' 
      product.stock = 'Out Of Stock'; //Since quantity is not given, I am updating stock to 'out of stock'
      product.groupname = 'FBT_'+ new Date().getTime(); // Assigns a unique Group name every time ordered together
      product.updatedTimeStamp = new Date().toISOString();
    }
  }
  res.render('products', { filteredProducts: products , title:'Updated recommendations List' ,message: 'Products Updated successfully'});
  //res.status(200).json({ message: 'Products sold successfully', products });
});

// Product Recommendations 

app.get('/recommendations/:id', (req, res) => {
  
  const { id } = req.params;

  const productExists = products.some((p) => p.id === id);

  if (!productExists) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Logic to provide product recommendations based on Category using Id (Since SKU is not given)
  
  const recommendedProducts = products.filter((p) => p.category === products.find((p) => p.id == id).category && p.id !== id && p.id != id);

  //res.status(200).json(recommendedProducts);
  res.render('products', { filteredProducts: recommendedProducts , title:'Product recommendations List' });
});



app.listen(port, () => {
  console.log(`Product microservice is running on http://localhost:${port}`);
});
