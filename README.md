# trboapp
Implementation of Product Management Microservice in Node.js for an e-commerce platform


Developed a trboapp microservice using Express - Node JS with 4 API Points
1.	Import API:
Created a post method, where the CSV file path is provided in request body. Using file system module and csv-Parser loaded into the variable.
      Loaded Title, Description, Category, Price, Diet, Stock into variable ‘product’.

2.	Product List with Sort and Filter functionality:
Created a get method, to list the products from CSV. To Sort and Filter parameters passed the arguments with URL as Params.
Can be sorted by price, diet, timestamp of last update, stock level, and product name. 
Can be filtered by price, diet,  stock level, and product name.
Example: http://<Servername>/products/?sortBy=<ColumnName>&sortOrder=<asc/desc>&<filterName>
Displayed the product list in EJS View Template. For reference attached screenshots
3.	 Sell API Endpoint:
Created a post method, when a order is placed the 
To Update Stock: Since quantity is not given, I am updating stock to 'out of stock
To Track products brought together: 
I have assigned a unique groupname with date and timestamp so that we can use this groupname to get recently brought products together.
Updated Timestamp: Updated date and time stamp when stock level is changed 

4.	 Recommended Products API:
Implemented a get method to get product recommendation, since the SKU is not given. Updated using ID and Category. Displayed it in EJS View Template.
Get URL: http://<Servername>/products/<id>

Performance and Quality:  
•	To ensure quality and coding standards - Used ESLint - JavaScript linter that checks style, formatting, and coding standards.
•	To Ensure performance, added error logging while parsing the CSV file to handle errors efficiently.
•	Used Express.js to handle a large number of concurrent connections efficiently. Express application is be scaled.
•	Additionally load testing and profiling can to done to avoid performance bottlenecks.

Validation and Testing:
•	Validated Params from Method URLs, before implementing the logics
o	For Instance, In Recommended Products API method, Validated the product id is valid and its present product list.
o	In Get Products API, validated the inputs before passing them into the filters
•	Done Unit testing by giving different inputs to the methods. 
•	In Additional to this, we can add express-validator - Plugin to implement input validation


Asymptotic Behavior:
•	For parsing a CSV file involves time complexity O(n) and using pipe method helps with efficiency.
•	Node.js' event-driven and non-blocking I/O model contributes to the application's scalability. Asynchronous operations, such as reading from a file or handling HTTP requests, allow the event loop to efficiently manage multiple operations.
•	The operations like sorting, updating, or filtering for products can affect asymptotic behavior. I have used filter (JavaScript functionality), which as code complexity of O(n). 
