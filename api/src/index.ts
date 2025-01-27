import express,{ Request, Response, NextFunction } from 'express';
import {getDatabasePool} from './db';
import cors from 'cors';
import dotenv from 'dotenv';
import { table } from 'console';
//import { table } from 'console';
dotenv.config();


const app = express();

app.use(express.json());

// Enable CORS for all routes (for development - IMPORTANT)
app.use(cors());

startServer();

async function startServer(){

    try {
        const pool = await getDatabasePool()
        if(!pool){
            throw new Error("Database pool not initialized");
            return;
        }
        await pool.query('SELECT 1');
        console.log("Database connection verified the server started");

    } catch (error) {
        console.error("Error starting the server:", error);
    }

    
}


//sanatize the table name
function sanitizeTableName(tableName: string): string | null{
    if(!tableName ||  !/^[a-zA-Z0-9_]+$/.test(tableName)){
        console.log("You dont have the allowed characters in a table name");
        
    }else{
        console.log("You have the allowed characters in a table name");
    }

    return tableName;
}

//sanitizeTableName("dmoney42$");


async function handleCreateTable(request: Request, response: Response): Promise<void>{
    //we have to test the connection to the database every time
    console.log("Received payload on backend:", request.body);

    try {
        const pool = await getDatabasePool();
        if(!pool){
            response.status(500).send('Database connection not established');
            return;
        }else{
            console.log("We received your request to connect to the database!");
        }

        
        const tableName = sanitizeTableName(request.body.tableName);
        if(!tableName){
            console.log("The table name did not come back sanitized!");
            response.status(400).json({ message: 'Invalid table name. Only alphanumeric characters and underscores are allowed.' });
            return;
        }
        console.log("We sanitized the table name: " + tableName);       

        /*
          check if table exists first
          * store default sql query with the table name the customer enters into a variable
          * use the pool variable to execute the query and check for the table name the user entered
          * if there is then the rows should be stored in a variable called rows
          * use if statement to check if there are any rows, if so then return response that table exitst
         */
          const checkTableQuery = `SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = DATABASE() AND LOWER(table_name) = ?`;
      
          const [rows] = await pool.query(checkTableQuery,[tableName.toLowerCase()]);
          console.log("Query executed to check if table exists: ", checkTableQuery);      
          console.log("After we checked the table query we got: " + JSON.stringify(rows));
        
          
          if (Array.isArray(rows) && rows.length > 0) {
            console.log(`The table ${tableName} already exists.`);
            response.status(400).json({ message: `Table ${tableName} already exists.` });
            return;
          }
          
            


        //EXECUTE THE QUERY after sanitizing the table name
        const createTableQuery = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (
                                                                                customer_id INT PRIMARY KEY AUTO_INCREMENT,
                                                                                first_name VARCHAR(255),
                                                                                last_name VARCHAR(255),
                                                                                email VARCHAR(255) UNIQUE,
                                                                                city VARCHAR(255),
                                                                                country VARCHAR(255)

                                                                                )`;


        await pool.query(createTableQuery);

        console.log(`The table name ${tableName} was created successfully!`);
        response.status(200).json({ message: `Table ${tableName} created successfully.` });


    } catch (error) {
        if (error instanceof Error) {
            console.error("Error in handleCreateTable:", error.message);
            response.status(500).json({ message: 'An error occurred while creating the table.', error: error.message });
        } else {
            console.error("Unknown error in handleCreateTable:", error);
            response.status(500).json({ message: 'An unknown error occurred while creating the table.' });
        }

    }
};


async function handleCreateOrders(request: Request, response: Response): Promise<void>{

    //we have to test the connection to the database every time
    console.log("Received handleCreateOrders payload on backend:", request.body);

    try {
        const pool = await getDatabasePool();
        if(!pool){
            response.status(500).send('Database connection not established');
            return;
        }else{
            console.log("We received your request to connect to the database!");
        }

        
        const tableName = sanitizeTableName(request.body.tableName);
        if(!tableName){
            console.log("The table name did not come back sanitized!");
            response.status(400).json({ message: 'Invalid table name. Only alphanumeric characters and underscores are allowed.' });
            return;
        }
        console.log("We sanitized the table name: " + tableName);       

        /*
          check if table exists first
          * store default sql query with the table name the customer enters into a variable
          * use the pool variable to execute the query and check for the table name the user entered
          * if there is then the rows should be stored in a variable called rows
          * use if statement to check if there are any rows, if so then return response that table exitst
         */
          const checkTableQuery = `SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = DATABASE() AND LOWER(table_name) = ?`;
      
          const [rows] = await pool.query(checkTableQuery,[tableName.toLowerCase()]);
          console.log("Query executed to check if table exists: ", checkTableQuery);      
          console.log("After we checked the table query we got: " + JSON.stringify(rows));
        
          
          if (Array.isArray(rows) && rows.length > 0) {
            console.log(`The table ${tableName} already exists.`);
            response.status(400).json({ message: `Table ${tableName} already exists.` });
            return;
          }
          
            


        //EXECUTE THE QUERY after sanitizing the table name
        const createTableQuery = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (
                                order_id INT AUTO_INCREMENT PRIMARY KEY,
                                customer_id INT NOT NULL,
                                order_date DATE NOT NULL,
                                total_amount DECIMAL(10, 2) NOT NULL,
                                CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)

                                                                                )`;


        await pool.query(createTableQuery);

        console.log(`The table name ${tableName} was created successfully!`);
        response.status(200).json({ message: `Table ${tableName} created successfully.` });


    } catch (error) {
        if (error instanceof Error) {
            console.error("Error in handleCreateTable:", error.message);
            response.status(500).json({ message: 'An error occurred while creating the table.', error: error.message });
        } else {
            console.error("Unknown error in handleCreateTable:", error);
            response.status(500).json({ message: 'An unknown error occurred while creating the table.' });
        }

    }
};

async function populateCustomers(request: Request, response: Response): Promise<void>{
    console.log("We received your request to populate the table with customers for the table: " + request.body.tableName);
    
    try {
        const pool = await getDatabasePool();
        if(!pool){
            response.status(500).send('Database connection not established');
            return;
        }else{
            console.log("We received your request to connect to the database!");
        }

        
        const tableName = sanitizeTableName(request.body.tableName);
        if(!tableName){
            console.log("The table name did not come back sanitized!");
            response.status(400).json({ message: 'Invalid table name. Only alphanumeric characters and underscores are allowed.' });
            return;
        }
        console.log("We sanitized the table name: " + tableName);       

        /*
          check if table exists first
          * store default sql query with the table name the customer enters into a variable
          * use the pool variable to execute the query and check for the table name the user entered
          * if there is then the rows should be stored in a variable called rows
          * use if statement to check if there are any rows, if so then return response that table exitst
         */
          const checkTableQuery = `SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = DATABASE() AND LOWER(table_name) = ?`;
      
          const [rows] = await pool.query(checkTableQuery,[tableName.toLowerCase()]);
          console.log("Query executed to check if table exists: ", checkTableQuery);      
          console.log("After we checked the table query we got: " + JSON.stringify(rows));
        
            



        const insertTableValuesQuery = `INSERT INTO \`${tableName}\` (first_name, last_name, email, city, country)
        VALUES 
        ('Alice', 'Smith', 'alice.smith@example.com', 'New York', 'USA'),
        ('Bob', 'Johnson', 'bob.johnson@example.com', 'Los Angeles', 'USA'),
        ('John', 'Doe', 'john.doe@example.com', 'Chicago', 'USA'),
        ('Emily', 'Brown', 'emily.brown@example.com', 'Houston', 'USA'),
        ('Michael', 'Williams', 'michael.williams@example.com', 'San Francisco', 'USA'),
        ('Sophie', 'Wilson', 'sophie.wilson@example.com', 'Toronto', 'Canada'),
        ('James', 'Taylor', 'james.taylor@example.com', 'London', 'UK'),
        ('Minjun', 'Kim', 'minjun.kim@example.com', 'Seoul', 'Korea'),
        ('Charlotte', 'Evans', 'charlotte.evans@example.com', 'Vancouver', 'Canada'),
        ('Henry', 'Walker', 'henry.walker@example.com', 'Manchester', 'UK')`;

        await pool.query(insertTableValuesQuery);

        console.log(`The table name ${tableName} was popuplated successfully!`);
        response.status(200).json({ message: `Table ${tableName} populated with customers successfully.` });


    } catch (error) {
        if (error instanceof Error) {
            console.error("Error in handleCreateTable:", error.message);
            response.status(500).json({ message: 'An error occurred while populating the table with customers.', error: error.message });
        } else {
            console.error("Unknown error in handleCreateTable:", error);
            response.status(500).json({ message: 'An unknown error occurred while populating the table with customers.' });
        }

    }
};

async function populateOrders(request: Request, response: Response): Promise<void>{
    console.log("We received your request to populate the orders table!")
    try {
        const pool = await getDatabasePool();
        if(!pool){
            response.status(500).send('Database connection not established');
            return;
        }else{
            console.log("We received your request to connect to the database!");
        }

        
        const tableName = sanitizeTableName(request.body.tableName);
        if(!tableName){
            console.log("The table name did not come back sanitized!");
            response.status(400).json({ message: 'Invalid table name. Only alphanumeric characters and underscores are allowed.' });
            return;
        }
        console.log("We sanitized the table name: " + tableName);       

        /*
          check if table exists first
          * store default sql query with the table name the customer enters into a variable
          * use the pool variable to execute the query and check for the table name the user entered
          * if there is then the rows should be stored in a variable called rows
          * use if statement to check if there are any rows, if so then return response that table exitst
         */
          const checkTableQuery = `SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = DATABASE() AND LOWER(table_name) = ?`;
      
          const [rows] = await pool.query(checkTableQuery,[tableName.toLowerCase()]);
          console.log("Query executed to check if table exists: ", checkTableQuery);      
          console.log("After we checked the table query we got: " + JSON.stringify(rows));
        
            



        const insertTableValuesQuery = `INSERT INTO \`${tableName}\` (customer_id, order_date, total_amount)
        VALUES 
            (1, '2025-01-01', 250.00),
            (2, '2025-01-02', 150.50), 
            (3, '2025-01-03', 300.75), 
            (4, '2025-01-04', 400.00),
            (5, '2025-01-05', 500.25), 
            (6, '2025-01-06', 600.10), 
            (7, '2025-01-07', 700.50), 
            (8, '2025-01-08', 800.00), 
            (9, '2025-01-09', 900.75), 
            (10, '2025-01-10', 1000.00)`;

        await pool.query(insertTableValuesQuery);

        console.log(`The table name ${tableName} was popuplated successfully!`);
        response.status(200).json({ message: `Table ${tableName} populated with customers successfully.` });


    } catch (error) {
        if (error instanceof Error) {
            console.error("Error in handleCreateTable:", error.message);
            response.status(500).json({ message: 'An error occurred while populating the table with customers.', error: error.message });
        } else {
            console.error("Unknown error in handleCreateTable:", error);
            response.status(500).json({ message: 'An unknown error occurred while populating the table with customers.' });
        }

    }

}

async function handlejoinTables(request: Request, response: Response): Promise<void>{
    console.log("We received your request to join the tables");
    const {table1, table2} = request.query;
    console.log("The name of the table1 in handljointables is " + table1);
    console.log("The name of table2 in handlejoinTables is " + table2);

    try {
        const pool = await getDatabasePool();
        const query = `
            SELECT 
            t1.customer_id AS customer_id, 
            t1.first_name AS customer_first_name, 
            t1.last_name AS customer_last_name,
            t2.order_id AS order_id, 
            t2.order_date AS order_date
            FROM \`${table1}\` AS t1
            INNER JOIN \`${table2}\` AS t2
            ON t1.customer_id = t2.customer_id
        `;

        const [rows] = await pool.query(query);
        response.status(200).json(rows);

    } catch (error) {
        console.error('Error performing INNER JOIN:', error);

    }

}



async function handleGetTableData(request: Request, response: Response): Promise<void>{
    console.log("You are inside the handleGetTableData function");
    const {tableName} = request.query;

    if (!tableName || typeof tableName != 'string'){
        response.status(500).json({message: "Invalid table name"});
        return;
    }

    try {
        const pool = await getDatabasePool();
        const query = `SELECT * FROM \`${tableName}\``;
       const [rows] = await pool.query(query);
       response.status(200).json(rows);
    } catch (error) {
        response.status(500).json({message: 'An error occurred while trying to get the table data'});
    }
   
}


const handleAlterTable = async (request: Request, response: Response): Promise<void> => {
    console.log("We received your request to alter the table!");
    const {tableName} = request.body;
    console.log("The table you requested to alter is: " + JSON.stringify(tableName));
    if(!tableName || typeof tableName !== 'string'){
        response.status(400).json({message: "Invalid table name in your alter table request"});
        return;
    }
    //next we connect to the database using trycath

    try {
        console.log("You are inside the try block for alter table");
        const pool = await getDatabasePool();
        if(!pool){
            throw new Error("Database pool not initialized");
            return;
        }
        console.log("We got a database pool");
        const query1 = `UPDATE \`${tableName}\` 
                       SET first_name = 'Updated First Name', 
                       last_name = 'Updated Country', 
                       city = 'Updated City'
                       WHERE city = 'New York';`;

        await pool.query(query1);

        const query2 = `SELECT * FROM \`${tableName}\`;`;
        const[rows] = await pool.query(query2);
        console.log("The contents of the rows object is: " + JSON.stringify(rows));
        response.status(200).json(rows);
    } catch (error) {
        response.status(500).json({message: 'An error occurred while altering the table data.'});
    }
};

const handleGroupByCountry = async (request: Request, response: Response): Promise<void> => {
    const {tableName} = request.query;
    console.log("We received your request to group the by country in the table named: " + JSON.stringify(tableName));

    try {
        const pool = await getDatabasePool();
        if(!pool){
            console.log("The database is not initizlied");
        }

        const query = `
            SELECT country, COUNT(*) AS customer_count
            FROM \`${tableName}\`
            GROUP BY country;`;

        const [rows] = await pool.query(query);
        console.log("The contents of the group by country table is: " + JSON.stringify(rows));
        response.status(200).json(rows);
    } catch (error) {
        console.log("There was an error while grouping by country " + error);
    }
};


const handlegroupCountriesByFirstLetter = async (request: Request, response: Response): Promise<void> => {
    console.log("We received your request to group countries by first letter");
    const {tableName} = request.query;
    console.log("The table name we want to group countries by first letter is: " + JSON.stringify(tableName));

    
    if(!tableName || typeof tableName !== 'string'){
        response.status(400).json({message: 'Invalid table name came back after requesting to group countries by first letter'});
        return;
    }

    try {
        const pool = await getDatabasePool();
        const query = `
            SELECT 
                country,
                COUNT(*) AS customer_count
            FROM 
                \`${tableName}\`
            WHERE 
                country LIKE 'U%' 
            GROUP BY 
                country
            HAVING 
                COUNT(*) > 1
            ORDER BY 
                customer_count DESC
            LIMIT 
                2;        
        `;

        const [rows] = await pool.query(query);

        console.log("The contents of the rows array when we requested to the database to group countries by first name is " + JSON.stringify(rows));
     
        response.status(200).json(rows);

    } catch (error) {
        console.log("There was an error trying to group table by first letter u " + error);
        response.status(500).json({message: 'An error occurred while trying to group countries by first letter U'});

    }

    

};


// All route handlers go below here
app.post('/api/createTable',handleCreateTable);

app.post('/api/createOrders', handleCreateOrders);

app.post('/api/populateCustomers', populateCustomers);

app.post('/api/populateOrders', populateOrders);

app.put('/api/alterTableData',handleAlterTable);

app.get('/api/getTableData',handleGetTableData);

app.get('/api/groupByCountry',handleGroupByCountry);

app.get('/api/groupCountriesByFirstLetter',handlegroupCountriesByFirstLetter);

app.get('/api/joinTables', handlejoinTables);

app.use(cors({
    origin: 'http://localhost:8080', // Replace with your frontend's URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

app.get('/', (request, response) => {
    response.send('Hello');
});

const port = parseInt(process.env.API_PORT || '8000', 10);

if (isNaN(port)) {
    console.error("Invalid port number specified in .env or default");
    process.exit(1);
}

app.listen(port, ()=>{
    console.log(`Server listening on port ${port}`);
});