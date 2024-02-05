import express from 'express';
import bodyParser from 'body-parser';
import csvParser from 'csv-parser';
import fs from 'fs/promises';
import { dirname } from 'path';
import path from 'path';
import { fileURLToPath } from 'url';
const app = express();
const port = 3000;
app.set('view engine', 'ejs'); // Set EJS as the view engine
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.set('views', __dirname + '/views');
import {parse, stringify} from 'flatted';
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
// To store Product List
let products = [];



//Import Product List API

app.post('/import', async (req, res) => {
  const folderPath = req.body.filePath;
  if(!folderPath){
    res.status(500).json({ error: 'Invalid folderPath' });
  }
  try {
    await importFunction(folderPath);
    res.status(200).json({ products, message: 'Product feeds imported successfully' });
  } catch (error) {
    console.error('Error during import:', error);
    res.status(500).json({ error: 'Error during import' });
  }
});


// List products 

app.get('/products', async(req, res) => {

  if(products.length == 0){    // Checks if products are alreay imported, if not imports 
      try {
      await importFunction('/trboapp');
    } catch (error) {
      console.error('Error during import:', error);
    }
  }

  // Implement filtering and ordering logic here based on query parameters
  const { sortBy, sortOrder, filterByName, filterByStock ,  minPrice, maxPrice } = req.query;

  //Flitering Logic By Title, Stock, Price
  let filteredProducts = [...products];

  if(filterByName){
       filteredProducts = filteredProducts.filter(product => product.title.toLowerCase().replace(/ +/g, "").includes(filterByName.toLowerCase().replace(/ +/g, "")));
  }

  if(filterByStock){
       filteredProducts = filteredProducts.filter(product => product.stock.toLowerCase().replace(/ +/g, "").includes(filterByStock.toLowerCase().replace(/ +/g, "")));
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
});

// Sell products 

app.post('/sell', async(req, res) => {
  if(products.length == 0){    // Checks if products are alreay imported, if not imports 
      try {
      await importFunction('/trboapp');
    } catch (error) {
      console.error('Error during import:', error);
    }
  }
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
    res.status(200).json({ products, message: 'Product recommendations updated successfully' });
  });

// Product Recommendations 

app.get('/recommendations/:SKU', async(req, res) => {
  if(products.length == 0){    // Checks if products are alreay imported, if not imports 
      try {
      await importFunction('/trboapp');
    } catch (error) {
      console.error('Error during import:', error);
    }
  }

  const { SKU } = req.params;

  const productExists = products.some((p) => p.SKU === SKU);

  if (!productExists) {
    return res.status(404).json({ error: 'Product not found' });
  }
 let recommendedProducts = [];
  // Logic to provide product recommendations based on groupname using SKU, if groupname is not assigned yet uses category to filter
  recommendedProducts = products.filter((p) =>p.groupname!= "" && p.groupname === products.find((p) => p.SKU == SKU).groupname);
  if(recommendedProducts.length == 0){
    recommendedProducts = products.filter((p) =>p.category === products.find((p) => p.SKU == SKU).category && p.SKU !== SKU);
  }
    
  res.render('products', { filteredProducts: recommendedProducts , title:'Product recommendations List' });
});


async function importFunction(filepath) {
  const folderPath = filepath;

  try {
    const files = await fs.readdir(folderPath);
     // Filter files with the .csv extension
    const csvFiles = files.filter((file) => path.extname(file).toLowerCase() === '.csv');
     // Import each CSV file
    await Promise.all(
      csvFiles.map(async (file) => {
        const filePath = path.join(folderPath, file);
        const fileData = await fs.readFile(filePath, 'utf8');

        const parser = csvParser();

        return new Promise((resolve, reject) => {
          parser.on('data', (row) => {
            row.updatedTimeStamp = new Date().toISOString();
            row.SKU = 'SKU_' + row.title.toLowerCase().replace(/ +/g, '');
            row.groupname = '';
            const { id, title, explanation, category, price, diet, stock, image_link, SKU, updatedTimeStamp, groupname } = row;
            products.push({ id, title, explanation, category, price, stock, image_link, SKU, updatedTimeStamp, groupname });
            row.timestamp = new Date().toISOString();
          });

          parser.on('end', () => {
            resolve();
          });

          parser.on('error', (error) => {
            reject(error);
          });

          parser.write(fileData);
          parser.end();
        });
      })
    );
  } catch (error) {
    console.error('Error reading the directory:', error);
    throw new Error('Error reading the directory');
  }
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});