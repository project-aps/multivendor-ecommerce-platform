// import { Pool } from "pg";

import pg from "pg";
const Pool = pg.Pool;

import dotenv from "dotenv";
dotenv.config();

console.log(process.env.DB_PASSWORD);

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Check database connection
pool.connect((err, client, done) => {
    if (err) {
        console.error("Error connecting to the database", err);
        return;
    }
    console.log(`Database connected : ${process.env.DB_DATABASE}`);
    done(); // Release client back to the pool
});

export const dbQuery = (text, params) => pool.query(text, params);
