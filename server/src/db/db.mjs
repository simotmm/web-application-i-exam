import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const databasePath = join(__dirname, "budget_sociale.db");

const db = new sqlite3.Database(databasePath, (err) => {
    if(err) throw err;
    
    db.run("PRAGMA foreign_keys = ON", (err) => {
        if(err) throw err;
    });
});

const iniziaTransazione = async() => {
    return new Promise((resolve, reject) => {
        db.run("BEGIN TRANSACTION", (err) => {
            if(err) reject(err);
            resolve(true);
        });
    });
}

const annullaTransazione = async() => {
    return new Promise((resolve, reject) => {
        db.run("ROLLBACK", (err) => {
            if(err) reject(err);
            resolve(true);
        });
    });
}

const concludiTransazione = async() => {
    return new Promise((resolve, reject) => {
        db.run("COMMIT", (err) => {
            if(err) reject(err);
            resolve(true);
        });
    });
}

export {db, iniziaTransazione, annullaTransazione, concludiTransazione};
