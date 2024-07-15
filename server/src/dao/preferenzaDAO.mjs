import {db} from "../db/db.mjs";
import Preferenza from "../components/Preferenza.mjs"

export default function PreferenzaDAO(){

    const getPreferenzaByIDQuery = "SELECT * FROM preferenze WHERE preferenzaID = ?"
    const getPreferenzeByPropostaIDQuery = "SELECT * FROM preferenze WHERE propostaID = ?";
    const getPreferenzeByUtenteIDQuery = "SELECT * FROM preferenze WHERE utenteID = ?";
    const addPreferenzaQuery = "INSERT INTO preferenze(utenteID, propostaID, punteggio) VALUES(?, ?, ?)";
    const deletePreferenzaByIDQuery = "DELETE FROM preferenze WHERE preferenzaID = ?";

    this.getPreferenzaByID = (preferenzaID) => {
        return new Promise((resolve, reject) => {
            db.get(getPreferenzaByIDQuery, [preferenzaID], (err, row) => {
                if(err){
                    reject(err);
                    return;
                }
                if(!row){
                    reject(new Error("preferenza inesistente"));
                    return;
                }
                resolve(new Preferenza(row.preferenzaID, row.utenteID, row.propostaID, row.punteggio));
            });
        });
    }

    this.getPreferenzeByPropostaID = (propostaID) => {
        return new Promise((resolve, reject) => {
            db.all(getPreferenzeByPropostaIDQuery, [propostaID], (err, rows) => {
                if(err){
                    reject(err);
                    return;
                }
                if(!rows){
                    resolve([]);
                }
                let preferenze = [];
                for(let row of rows)
                    preferenze.push(new Preferenza(row.preferenzaID, row.utenteID, row.propostaID, row.punteggio));
                resolve(preferenze);
            });
        });
    };
    
    this.getPreferenzeByUtenteID = (utenteID) => {
        return new Promise((resolve, reject) => {
            db.all(getPreferenzeByUtenteIDQuery, [utenteID], (err, rows) => {
                if(err){
                    reject(err);
                    return;
                }
                if(!rows){
                    resolve([]);
                }
                let preferenze = [];
                for(let row of rows)
                    preferenze.push(new Preferenza(row.preferenzaID, row.utenteID, row.propostaID, row.punteggio));
                resolve(preferenze);
            });
        });
    };

    this.addPreferenza = (utenteID, propostaID, punteggio) => {
        return new Promise((resolve, reject) => {                       //function serve per this.lastID
            db.run(addPreferenzaQuery, [utenteID, propostaID, punteggio], function(err){ 
                if(err){
                    reject(err);
                    return;
                }
                resolve(this.lastID);
            });
        });
    };

    this.deletePreferenzaByID = (preferenzaID) => {
        return new Promise((resolve, reject) => {
            db.run(deletePreferenzaByIDQuery, [preferenzaID], (err) => {
                if(err){
                    reject(err);
                    return;
                }
                resolve(true);
            });
        });
    };

}