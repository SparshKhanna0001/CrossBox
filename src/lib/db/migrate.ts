import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { neon } from "@neondatabase/serverless";
import * as dotenv from 'dotenv'

dotenv.config({ path: ".env" });

if( !process.env.DATABASE_URL )
{
    throw new Error( "The env are not set" )
}

async function runMigration() 
{
    console.log("starting the db migration")

    try 
    {
        // create connection to neon db
     const sql = neon( process.env.DATABASE_URL! )

     //initialize drizzle with that connection
     const db = drizzle(sql)

     //now run that from drizzle folder
     console.log("Running migrations...")
     await migrate(db, {migrationsFolder: "./drizzle"})
     console.log("Completed running migrations...")

    } catch (error)

    {
        console.error("Migration failed", error)
        process.exit(1)
    }
}

//Run that function
runMigration();