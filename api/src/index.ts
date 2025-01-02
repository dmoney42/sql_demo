import express,{ Request, Response, NextFunction } from 'express';
import {getDatabasePool} from './db';
import cors from 'cors';
import dotenv from 'dotenv';
import { table } from 'console';
dotenv.config();


const app = express();

app.use(express.json());

// Enable CORS for all routes (for development - IMPORTANT)
app.use(cors());


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

startServer();

async function startServer(){

    try {
        const pool = await getDatabasePool()
        if(!pool){
            throw new Error("Database pool not initialized");
        }
        await pool.query('SELECT 1');
        console.log("Database connection verified the server started");

    } catch (error) {
        console.error("Error starting the server:", error);
    }


   


 //   app.post('/api/createTable',handleCreateTable);

    
}
    

/*
app.post('/api/createTable', async(request, response)=>{
    try {
        
        const tableName = sanitizeTableName(request.body.tableName);
        console.log("We recevied your request from the client to create a table named " + tableName);

       /
        if(!tableName) {
            return response.status(400).json({message: 'Invalid table name. Only alphanumeric characters and underscores are allowed.'});
        }
            
        
        
        if(!dbpool){
            return response.status(500).send('Database connection not established');
        }
        
        
       // const sql = `CREATE TABLE IF NOT EXISTS ${tableName}`
        

    } catch (error) {
        console.log("Theres an error in the post request of api/createTable" + error);
    }
});
*/

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