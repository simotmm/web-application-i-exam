import {db} from "../db/db.mjs";
import Proposta from "../components/Proposta.mjs"

export default function PropostaDAO(){

    const getProposteQuery = "SELECT p.propostaID, p.utenteID, p.descrizione, p.costo, p.punteggio, p.approvata, u.username \
                              FROM proposte p, utenti u \
                              WHERE p.utenteID = u.utenteID";
    const getPropostaByIDQuery = "SELECT * FROM proposte WHERE propostaID = ?";
    const getProposteByUtenteIDQuery = "SELECT * FROM proposte WHERE utenteID = ?";
    const addPropostaQuery = "INSERT INTO proposte(utenteID, descrizione, costo) VALUES(?, ?, ?)";
    const updatePropostaByIDQuery = "UPDATE proposte SET descrizione = ?, costo = ? WHERE propostaID = ?";
    const setApprovazionePropostaQuery = "UPDATE proposte SET punteggio = ?, approvata = ? WHERE propostaID = ?";
    const deletePropostaByIDQuery = "DELETE FROM proposte WHERE propostaID = ?";
    const deleteAllQuery = "DELETE FROM proposte";
    
    this.getPropostaByID = (propostaID) => {
        return new Promise((resolve, reject) => {
            db.get(getPropostaByIDQuery, [propostaID], (err, row) => {
                if(err){
                    reject(err);
                    return;
                }
                if(!row){
                    reject(new Error("proposta inesistente"));
                    return;
                }

                resolve(new Proposta(row.propostaID, row.utenteID, null, row.descrizione, row.costo, null, row.punteggio, row.approvata));
            });
        });
    };

    this.getProposte = () => {
        return new Promise((resolve, reject) => {
            db.all(getProposteQuery, [], (err, rows) => {
                if(err){
                    reject(err);
                    return;
                }
                if(!rows){
                    resolve([]);
                }
                let proposte = [];
                for(let row of rows)
                    proposte.push(new Proposta(row.propostaID, row.utenteID, row.username, row.descrizione, row.costo, null, row.punteggio, row.approvata));
                resolve(proposte);
            });
        });
    };

    this.getProposteByUtenteID = (utenteID) => {
        return new Promise((resolve, reject) => {
            db.all(getProposteByUtenteIDQuery, [utenteID], (err, rows) => {
                if(err){
                    reject(err);
                    return;
                }
                if(!rows){
                    resolve([]);
                }
                let proposte = [];
                for(let row of rows)
                    proposte.push(new Proposta(row.propostaID, row.utenteID, null, row.descrizione, row.costo, null, row.punteggio, row.approvata));
                resolve(proposte);
            });
        });
    };

    this.addProposta = (utenteID, descrizione, costo) => {
        return new Promise((resolve, reject) => {
            db.run(addPropostaQuery, [utenteID, descrizione, costo], function(err){ //function serve per this.lastID
                if(err){
                    reject(err);
                    return;
                }
                resolve(this.lastID);
            });
        });
    };
    
    this.updatePropostaByID = (propostaID, descrizione, costo) => {
        return new Promise((resolve, reject) => {
            db.run(updatePropostaByIDQuery, [descrizione, costo, propostaID], (err) => {
                if(err){
                    reject(err);
                    return;
                }
                resolve(true);
            });
        });
    };

    this.setApprovazioneProposta = (punteggio, approvazione, propostaID) => {
        return new Promise((resolve, reject) => {
            db.run(setApprovazionePropostaQuery, [punteggio, approvazione, propostaID], (err) => {
                if(err){
                    reject(err);
                    return;
                }
                resolve(true);
            });
        });
    }

    this.deletePropostaByID = (propostaID) => {
        return new Promise((resolve, reject) => {
            db.run(deletePropostaByIDQuery, [propostaID], (err) => {
                if(err){
                    reject(err);
                    return;
                }
                resolve(true);
            });
        });
    };

    this.deleteAll = () => {
        return new Promise((resolve, reject) => {
            db.run(deleteAllQuery, [], (err) => {
                if(err){
                    reject(err);
                    return;
                }
                resolve(true);
            });
        });
    }

}