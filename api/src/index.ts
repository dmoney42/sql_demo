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

app.post('/api/populateCustomers', populateCustomers);

app.put('/api/alterTableData',handleAlterTable);

app.get('/api/getTableData',handleGetTableData);

app.get('/api/groupByCountry',handleGroupByCountry);

app.get('/api/groupCountriesByFirstLetter',handlegroupCountriesByFirstLetter);

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