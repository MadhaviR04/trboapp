import express from 'express';
import bodyParser from 'body-parser';
import csvParser from 'csv-parser';
import fs from 'fs';
import { dirname } from 'path';
import path from 'path';
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

  const folderPath = '/trboapp/'; 
  //Logic to automatically import any file matching the .csv extension
  
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading the directory' });
    }

    // Filter files with the .csv extension
    const csvFiles = files.filter((file) => path.extname(file).toLowerCase() === '.csv');

    // Import each CSV file
    csvFiles.forEach((file) => {
      const filePath = path.join(folderPath, file);

      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => {
          // Assuming CSV columns: name, description, category, price, SKU, stock
          row.updatedTimeStamp = new Date().toISOString();
          row.SKU = 'SKU_'+row.title.toLowerCase().replace(/ +/g, "");
          row.groupname = "";
          const { title, explanation, category, price, diet, stock, image_link, SKU, updatedTimeStamp, groupname } = row;
          products.push({ title, explanation, category, price, stock, image_link, SKU, updatedTimeStamp, groupname });
          row.timestamp = new Date().toISOString();
        })
        .on('end', () => {
          console.log(products);
        })
        .on('error', (error) => {
          console.error(`Error during CSV parsing for ${file}:`, error.message);
        });
    });
});
}

//Import Product List API

app.post('/import', (req, res) => {

  const folderPath = '/'; 
  //Logic to automatically import any file matching the .csv extension
  
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading the directory' });
    }

    // Filter files with the .csv extension
    const csvFiles = files.filter((file) => path.extname(file).toLowerCase() === '.csv');

    // Import each CSV file
    csvFiles.forEach((file) => {
      const filePath = path.join(folderPath, file);

      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => {
          // Assuming CSV columns: name, description, category, price, SKU, stockconst { title, explanation, category, price, diet, stock } = row;
          row.updatedTimeStamp = new Date().toISOString();
          row.groupname = "";
          row.SKU = 'SKU_'+row.title.toLowerCase().replace(/ +/g, "");
          const { title, explanation, category, price, diet, stock, image_link, SKU, updatedTimeStamp, groupname } = row;
          products.push({ title, explanation, category, price, stock, image_link, SKU, updatedTimeStamp, groupname });
          row.timestamp = new Date().toISOString();
          products.push(row);
        })
        .on('end', () => {
          console.log(`Product feed imported successfully`);
        })
        .on('error', (error) => {
          console.error(`Error during CSV parsing`, error.message);
        });
    });
  return res.status(200).json({products, message: 'Product feeds imported successfully' });
  });
});


// List products 

app.get('/products', (req, res) => {

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
});

// Product Recommendations 

app.get('/recommendations/:SKU', (req, res) => {
  
  const { SKU } = req.params;

  const productExists = products.some((p) => p.SKU === SKU);

  if (!productExists) {
    return res.status(404).json({ error: 'Product not found' });
  }
 let recommendedProducts = [];
  // Logic to provide product recommendations based on groupname using SKU, if groupname is not assigned yet uses category to filter
  recommendedProducts = products.filter((p) =>p.groupname!= "" && p.groupname === products.find((p) => p.SKU == SKU).groupname && p.SKU !== SKU   && p.SKU != SKU);
  if(recommendedProducts.length == 0){
    recommendedProducts = products.filter((p) =>p.category === products.find((p) => p.SKU == SKU).category && p.SKU !== SKU   && p.SKU != SKU);
  }
    
  res.render('products', { filteredProducts: recommendedProducts , title:'Product recommendations List' });
});

app.listen(port, () => {
  console.log(`Product microservice is running on http://localhost:${port}`);
});
