import {db} from "../db/db.mjs";
import crypto from "crypto";
import Utente from "../components/Utente.mjs";

export default function UtenteDAO(){

    const TIPO_UTENTE_DEFAULT = 0;
    const getUtenteByUsernameQuery = "SELECT * FROM utenti WHERE username = ?";
    const addUtenteQuery = "INSERT INTO utenti(username, hash, salt) VALUES(?, ?, ?)";
    
    this.getUtente = (username, password) => {
        return new Promise((resolve, reject) => {
            db.get(getUtenteByUsernameQuery, [username], (err, row) => {
                if(err){
                    reject(err);
                    return;
                }
                if(!row) {
                    resolve(false); 
                    return; 
                }
                
                const utente = new Utente(row.utenteID, row.username, row.tipo, null, null);
                crypto.scrypt(password, row.salt, 32, function(err, hash) {
                    if(err) reject(err);
                    if(!crypto.timingSafeEqual(Buffer.from(row.hash, "hex"), hash)){
                        resolve(false);
                        return;
                    }
                    else
                        resolve(utente);
                  });
            });
        });
    }

    this.getUtenteByUsername = (username) => {
        return new Promise((resolve, reject) => {
            db.get(getUtenteByUsernameQuery, [username], (err, row) => {
                if(err) reject(err)
                if(!row){
                    resolve(false);
                    return;
                }
                resolve(new Utente(row.utenteID, row.username, row.tipo));
            });
        });
    }

    this.addUtente = (username, password) => {
        return new Promise((resolve, reject) => {
            const salt = crypto.randomBytes(16).toString("hex");

            crypto.scrypt(password, salt, 32, async(err, hash) => {
                if(err){
                    reject("error in hashing password");
                }
                else{
                    db.run(addUtenteQuery, [username, hash.toString("hex"), salt], function(err){ //function serve per usare this.lastID
                        if(err){
                            reject(err);
                            return;
                        }
                        resolve(new Utente(this.lastID, username, TIPO_UTENTE_DEFAULT));
                    });
                }
            });
        });
    }
}