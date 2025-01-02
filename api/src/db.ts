import mysql from 'mysql2/promise';
import dotenv from 'dotenv';


dotenv.config();


const dbConfig: mysql.PoolOptions = {
    host: "localhost",
    user: "mysql_demo",
    password: "FyKXr2Jubdk!y_Wy",
    database: "mysql_demo",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
}

//create the connection pool
let pool: mysql.Pool | null = null;

async function connectToDatabasePool(dbConfig: mysql.PoolOptions){
    console.log("We are inside the connect to database function");
    try {
        const newPool = await mysql.createPool(dbConfig);
    
        console.log("Connected to the MySQL database");
       return newPool;
    } catch (error) {
        console.error("There was an error connecting to MySQL " + error);
        process.exit(1);
    }
}


export async function getDatabasePool(){
    if(!pool){
        pool = await connectToDatabasePool(dbConfig)
    }

    return pool;
}