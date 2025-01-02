import mysql from 'mysql2/promise';
import dotenv from 'dotenv';


dotenv.config();


const dbConfig: mysql.PoolOptions = {
    host: process.env.DATABASE_HOST,
    user: "mysql_demo",
    password: "FyKXr2Jubdk!y_Wy",
    database: "mysql_demo",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
}

console.log("Environmental Variables:",{

    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_USER_PASSWORD,
    database: process.env.DATABASE_NAME,
}

);

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