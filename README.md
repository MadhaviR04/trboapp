Developed a microservice (Trboapp) using Express - Node JS with 4 API Points
Code implementation is provided in the GitHub – Dev branch.  
Url:  https://github.com/MadhaviR04/trboapp/tree/dev
This document explains the implementation below,
1.	Import API:
•	Created a post method, where the CSV files are loaded from directory. Using file system module and csv-Parser loaded into the variable.
•	Loaded Id, Title, Description, Category, Price, SKU, Stock, updatedTimeStamp into variable ‘product’.
•	created Timestamp, groupname, SKU variables while loading to perform other api functionalities  
Curl URL To call the API: curl -X POST -H "Content-Type: application/json" -d "{\"filePath\": \"<filePath>\"}" "http://localhost:3000/import"

2.	Product List with Sort and Filter functionality:
Created a get method, to list the products from CSV. To Sort and Filter parameters passed the arguments with URL as Params.
Can be sorted by price, SKU, stock level, date, and product name. 
Can be filtered by price, stock. 
Making SKU and Product name as filterable is not feasible as these are unique values. It would be better to make it searchable rather than filterable.
Example: http://<Servername>/products/?sortBy=<ColumnName>&sortOrder=<asc/desc>&<filterName>
Displayed the product list in EJS View Template. 

3.	 Sell API Endpoint:
Created a post method, when a order is placed the 
To Update Stock: Since quantity is not given, I am updating stock to 'out of stock
To Track products brought together: 
Due to time constraint and Database Limitations, I have used simple logic to implement this.
I have assigned a unique groupname with date and timestamp so that we can use this groupname to get Recommended products.

Preferred Implementation if more time was available:
I would have created a New Table in Database to track the Products brought together with columns ID, set of Product IDS, count of set repeated.
When order is placed, I would check if more than one product is brought and check if the set or sub set of the Product set already exist in DB contains the Product set. 

Case 1: If same set exists, I would increase the count of the set and update the set.
Case 2: If different set exists, but contains the new set IDs as a subset. I would increase the count of the new set by 2.
Case 3: If sub set of the new set already exists, I would increase the count of the existing subset.

Case 4: If not exists, I will add new combination set into the DB. 

This approach, would provide the combination of products brough together, so we can provide most relevant recommendations. 

Updated Timestamp: Updated date and time stamp when stock level is changed 

Curl URL To call the API: curl -X POST -H "Content-Type: application/json" -d "{\"order\": {\"<Product ID>\": <Quantity>, \"< Product ID >\": <Quantity>}}" <servername>

4.	 Recommended Products API:
Implemented a get method to get product recommendation using the SKU. Unique groupame is assigned to products when they are brought together.
Logic to provide product recommendations based on groupname using SKU, if groupname is not assigned yet uses category to filter.
 
Get URL: http://<Servername>/products/<SKU>

Performance and Quality:  
•	To ensure quality and coding standards, implemented ESLint - JavaScript linter that checks style, formatting, and coding standards.
•	To Ensure performance, added error logging while parsing the CSV file to handle errors efficiently.
•	Used Express.js to handle a large number of concurrent connections efficiently. Express application is be scaled.
•	Additionally load testing and profiling can to done to avoid performance bottlenecks. Tools like Apache Bench, and Node.js profiling modules can assist in this process

Validation and Testing:
•	Validated Params from Method URLs, before implementing the logics
o	For Instance, In Recommended Products API method, Validated the product id is a valid id or not.
o	In Get Products API, validated the inputs before passing them into the filters
•	Done Unit testing by giving different inputs to the methods. 
•	In Additional to this, we can add express-validator - Plugin to implement input validation


Asymptotic Behavior:
•	For parsing a CSV file involves time complexity O(n) and using pipe method helps with efficiency.
•	Node.js' event-driven and non-blocking I/O model contributes to the application's scalability. Asynchronous operations, such as reading from a file or handling other requests, allow the event loop to efficiently manage multiple operations.
•	The operations like sorting, updating, or filtering for products can affect asymptotic behavior. I have used filter (JavaScript functionality), which as code complexity of O(n). 
