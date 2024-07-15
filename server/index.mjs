import express from "express";
import morgan from "morgan";
import cors from "cors";

import passport from "passport";
import LocalStrategy from "passport-local";
import session from "express-session";
import { check, validationResult } from "express-validator";

import BudgetSocialeController from "./src/controllers/budgetSocialeController.mjs";
import UtenteController from "./src/controllers/utenteController.mjs";
import PropostaController from "./src/controllers/propostaController.mjs"
import PreferenzaController from "./src/controllers/preferenzaController.mjs";

/*** configurazione ***/

// controllers
const budgetSocialeController = new BudgetSocialeController();
const utenteController = new UtenteController();
const propostaController = new PropostaController();
const preferenzaController = new PreferenzaController();

// costanti per controlli
const ADMIN = -1;
const PATCH_BUDGETSOCIALE = "PATCH /api/budgetSociale";
const GET_PROPOSTE = "GET /api/proposte";
const GET_PROPOSTE_UTENTE = "GET /api/proposte/:utenteID";
const POST_PROPOSTE = "POST /api/proposte"
const PATCH_PROPOSTE = "PATCH /api/proposte";
const DELETE_PROPOSTE = "DELETE /api/proposte";
const POST_PREFERENZE = "POST /api/preferenze";
const DELETE_PREFERENZE = "DELETE /api/preferenze";

// inizializzazione di express
const app = new express();
const port = 3001;

app.use(express.json());
app.use(morgan("dev"));
const corsOptions = {   //cors per cross origin
    origin: "http://localhost:5173",
    optionSuccessStatus: 200,
    credentials: true
};
app.use(cors(corsOptions));

//local strategy di express per login e controllo della sessione
passport.use(new LocalStrategy(async function verify(username, password, callback){
    const utente = await utenteController.getUtente(username, password);
    if(!utente) 
        return callback(null, false, "Username o password non corretti");
    return callback(null, utente);
}));
passport.serializeUser(function(utente, callback){
    callback(null, utente); // quando avviene il login l'utente viene salvato nella sessione nell'interezza dei suoi campi
});
passport.deserializeUser(function(utente, callback){
    return callback(null, utente); //deserialize prende l'identificatore dell'utente nella sessione e restituisce l'oggetto intero, in questo caso coincidono
});

app.use(session({
    secret: "...inizializzazione della sessione...",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.authenticate("session"));

const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) return next();
    return res.status(401).json({error: "Non autorizzato"});
};

const isAdmin = (req, res, next) => {
    if(req.isAuthenticated() && req.user && req.user.tipo==ADMIN) return next();
    return res.status(401).json({error: "Non autorizzato"});
};

//validazione dei campi
const onValidationErrors = (validationResult, res) => {
    const errors = validationResult.formatWith(errorFormatter);
    console.error(errors);
    return res.status(422).json({validationErrors: errors.mapped()});
};
//mantiene solo il messaggio nella richiesta
const errorFormatter = ({msg}) => {
    return msg;
};
//validazione credenziali per login e registrazione
const validazioneCredenziali = [                // "/^\S*$/" = non contiene spazi
    check("username").isString().notEmpty().matches(/^\S*$/).withMessage("Il campo 'username' deve essere una stringa non vuota che non contiene spazi."),
    check("password").isString().notEmpty().matches(/^\S*$/).withMessage("Il campo 'password' deve essere una stringa non vuota che non contiene spazi.")
];

//validazione aggiornamento budgetSociale
const validazioneBudgetSociale = [
    check("budget").isFloat({ gt: 0 }).withMessage("Il campo 'budget' deve essere un numero decimale maggiore di zero"),
    check("fase").isInt({ min: 0, max: 3 }).withMessage("Il campo 'fase' deve essere un numero intero non nullo"),
];
//validazione proposta
const validazioneProposta = [
    check("utenteID").isInt().withMessage("Il campo 'utenteID' deve essere un numero intero non nullo"),
    check("descrizione").isString().notEmpty().isLength({ max: 60 }).withMessage("Il campo 'descrizione' della proposta non può essere vuoto"),
    check("costo").isFloat({ gt: 0 }).withMessage("Il campo 'costo' deve essere un numero decimale maggiore di zero"),
];
//validazione preferenza
const validazionePreferenza = [
    check("propostaID").isInt().withMessage("Il campo 'propostaID' deve essere un numero intero non nullo"),
    check("utenteID").isInt().withMessage("Il campo 'utenteID' deve essere un numero intero non nullo"),
    check("punteggio").isInt({ min: 1, max: 3 }).withMessage("Il campo 'punteggio' deve essere un numero intero compreso tra 1 e 3"),
];
//autorizzazione proposta
const validazioneAutorizzazioneProposta = (utente, proposta) => {
    return utente && utente.utenteID==proposta.utenteID;
}
//autorizzazione preferenza
const validazioneAutorizzazionePreferenza = async(utente, preferenza) => {
    try{
        const proposta = await propostaController.getPropostaByID(preferenza.propostaID);
        return utente && proposta.utenteID!=utente.utenteID;
    }
    catch(err){
        return err;
    }
}

//funzione utile per la validazione delle azioni
const getFaseCorrente = async() => {
    try{
        const budgetSociale = await budgetSocialeController.getBudgetSociale();
        return budgetSociale && budgetSociale.fase;
    }
    catch(err){
        return err;
    }
}

// validazione dell'azione richiesta in base alla fase corrente
const validazioneAzione = async(utente, azione) =>{

    const azioniValide = [ //azioni valide
        [PATCH_BUDGETSOCIALE, GET_PROPOSTE_UTENTE], //fase 0
        [POST_PROPOSTE, GET_PROPOSTE_UTENTE, PATCH_PROPOSTE, DELETE_PROPOSTE, PATCH_BUDGETSOCIALE], //fase 1
        [GET_PROPOSTE, GET_PROPOSTE_UTENTE, POST_PREFERENZE, DELETE_PREFERENZE, PATCH_BUDGETSOCIALE], //fase 2
        [GET_PROPOSTE, GET_PROPOSTE_UTENTE, PATCH_BUDGETSOCIALE] //fase 3
    ]; //non ci sono controlli per GET budgetSociale perchè chiunque può farla sempre

    let fase;
    try{
        fase = await getFaseCorrente();
        if(fase<0 || fase>3)
            return false;
    }
    catch(err){
        return err;
    }

    if(!azioniValide[fase].includes(azione))
        return false;

    if(fase==2 && azione==GET_PROPOSTE && !utente)
        return false; // controllo sull'utente perchè GET proposte non ha isLoggedIn (nella fase 3 si può accedere sempre)

    return true;
}


/*** API Utenti ***/
//POST /api/sessions (login)
app.post("/api/sessions", validazioneCredenziali, function(req, res, next) {
    
    const errori = validationResult(req);
    if(!errori.isEmpty())
        return onValidationErrors(errori, res);

    passport.authenticate("local", (err, user, info) => {
        if (err)
            return next(err);
        if (!user) 
             return res.status(401).send(info);

        req.login(user, (err) => {
            if (err)
                return next(err);
          
            return res.status(200).json(req.user);
        });
    })(req, res, next);
  });

//POST /api/nuovoUtente (registrazione)
app.post("/api/nuovoUtente", validazioneCredenziali, async(req, res) =>{
    const errori = validationResult(req);
    if(!errori.isEmpty())
        return onValidationErrors(errori, res);

    if(await utenteController.getUtenteByUsername(req.body.username)) 
        return res.status(409).json({error: "Username non disponibile, inserire un username diverso"});

    try{
        const utente = await utenteController.addUtente(req.body.username, req.body.password);
        return res.status(201).json({...utente});
    }
    catch(err){
        console.error("errore server: "+err.message);
        return res.status(500).json({error: "Impossibile registrare l'utente."});
    }
});

//GET /api/sessions/current (controlla se l'utente è loggato)
app.get("/api/sessions/current", (req, res) => {
    if(req.isAuthenticated()) 
        return res.status(200).json(req.user);
    else 
        return res.status(401).json({error: "Non autenticato"});
});

// DELETE /api/sessions/current (logout)
app.delete("/api/sessions/current", (req, res) => {
    req.logout(() => { 
        return res.status(204).end(); 
    });
});


/*** API BudgetSociale (fase, budget) ***/
// GET /api/budgetSociale
app.get("/api/budgetSociale", async(req, res) => {
    try{
        let budgetSociale = await budgetSocialeController.getBudgetSociale();
        if(!req.user && budgetSociale.fase!=3) // se l'utente non è loggato il client nelle prime 3 fasi (0,1,2) vede solo il numero della fase corrente 
            budgetSociale = {fase: budgetSociale.fase};
        return res.status(200).json(budgetSociale);
    }
    catch(err){
        return res.status(500).json({ error: err.message });
    }
});

// PATCH /api/budgetSociale
app.patch("/api/budgetSociale", isAdmin, validazioneBudgetSociale, async(req, res) => {
    try{
        const ok = await validazioneAzione(req.user, PATCH_BUDGETSOCIALE);
        if(!ok)
            return res.status(401).json({error: "Accesso non autorizzato. L'utente corrente non può compiere l'azione '"+PATCH_BUDGETSOCIALE+"'."});
    }
    catch(err){
        return err;
    }

    try{
        const ok = await budgetSocialeController.updateBudgetSociale(req.body);
        return res.status(200).json(ok);
    }
    catch(err){
        return res.status(500).json({ error: err.message });
    }
});


/*** API proposte ***/
// GET /api/proposte/:utenteID
app.get("/api/proposte/:utenteID", isLoggedIn, async(req, res) => {
    const utente = req.user;
    const utenteID = req.params.utenteID;
    if(utenteID!=utente.utenteID)
        return res.status(401).json({error: "Accesso non autorizzato, un utente può visualizzare solo le sue proposte."});

    let ok = await validazioneAzione(req.user, GET_PROPOSTE_UTENTE);
    if(!ok)
        return res.status(401).json({error: "In questa fase l'utente corrente non può compiere l'azione '"+GET_PROPOSTE_UTENTE+"'."});

    try{
        ok = await utenteController.getUtenteByUsername(utente.username);
        if(!ok)
            return res.status(404).json({error: "Utente inesistente."});

        const proposte = await propostaController.getProposteByUtenteID(utenteID);
        
        return res.status(200).json(proposte);
    }
    catch(err){
        return res.status(500).json({ error: err.message });
    }
});

// GET /api/proposte
app.get("/api/proposte", async(req, res) => { 
    try{
        const ok = await validazioneAzione(req.user, GET_PROPOSTE);
        if(!ok)
            return res.status(401).json({error: "In questa fase l'utente corrente non può compiere l'azione '"+GET_PROPOSTE+"'."});
    }
    catch(err){
        return res.status(500).json({ error: err.message });
    } 

    try{
        const proposte = await propostaController.getProposte(req.user);
        return res.status(200).json(proposte);
    }
    catch(err){
        return res.status(500).json({ error: err.message });
    }
});

// GET /api/proposteFaseFinale
app.get("/api/proposteFaseFinale", async(req, res) => { 
    try{
        const ok = await validazioneAzione(req.user, GET_PROPOSTE);
        if(!ok)
            return res.status(401).json({error: "In questa fase l'utente corrente non può compiere l'azione '"+GET_PROPOSTE+"'."});
    }
    catch(err){
        return res.status(500).json({ error: err.message });
    } 

    try{
        let proposte = await propostaController.getProposteFaseFinale(); // l'utente non loggato non riceve le proposte non approvate
        proposte = proposte && req.user? proposte : {proposteApprovate: proposte && proposte.proposteApprovate, proposteNonApprovate: null}; 
        return res.status(200).json(proposte);
    }
    catch(err){
        return res.status(500).json({ error: err.message });
    }
});

// POST /api/proposte
app.post("/api/proposte", isLoggedIn, validazioneProposta, async(req, res) => { 
    if(!validazioneAutorizzazioneProposta(req.user, req.body))
        return res.status(409).json({error: "utente.utenteID e proposta.utenteID devono coincidere."});

    try{
        const ok = await validazioneAzione(req.user, POST_PROPOSTE); 
        if(!ok)
            return res.status(401).json({error: "In questa fase l'utente corrente non può compiere l'azione '"+POST_PROPOSTE+"'."});

        const budgetSociale = await budgetSocialeController.getBudgetSociale();
        if(!budgetSociale)
            return res.status(500).json({error: "Impossbile accedere alle informazioni dello stato corrente."});
        if(req.body.costo>budgetSociale.budget)
            return res.status(409).json({error: "Il costo della proposta non può superare il budget complessivo."});

        const proposte = await propostaController.getProposteByUtenteID(req.user.utenteID);
        if(!proposte)
            return res.status(500).json({error: "Impossbile accedere alle informazioni delle proposte dell'utente."});
        if(proposte.length>=3)
            return res.status(409).json({error: "Un utente può salvare al massimo 3 proposte."});
            
    }
    catch(err){
        return res.status(500).json({ error: err.message });
    } 

    try{
        const ok = await propostaController.addProposta(req.body);
        return res.status(201).json(ok);
    }
    catch(err){
        return res.status(500).json({ error: err.message });
    }
});

// PATCH /api/proposte
app.patch("/api/proposte", isLoggedIn, validazioneProposta, async(req, res) => {
    try{
        const ok = await validazioneAzione(req.user, PATCH_PROPOSTE);
        if(!ok)
            return res.status(401).json({error: "In questa fase l'utente corrente non può compiere l'azione '"+PATCH_PROPOSTE+"'."});

        const budgetSociale = await budgetSocialeController.getBudgetSociale();
        if(!budgetSociale)
            return res.status(500).json({error: "Impossbile accedere alle informazioni dello stato corrente."});
        if(req.body.costo>budgetSociale.budget)
            return res.status(409).json({error: "Il costo della proposta non può superare il budget complessivo."});
    }
    catch(err){
        return err;
    }

    if(!validazioneAutorizzazioneProposta(req.user, req.body))
        return res.status(401).json({ message: "Impossibile modificare la proposta. Un utente può modificare solo le sue proposte."});

    try{
        const ok = await propostaController.updatePropostaByID(req.body);
        return res.status(204).end();
    }
    catch(err){
        return res.status(500).json({ error: err.message });
    }
});

// DELETE /api/proposte/:propostaID
app.delete("/api/proposte/:propostaID", isLoggedIn, async(req, res) => { 
    try{
        const ok = await validazioneAzione(req.user, DELETE_PROPOSTE);
        if(!ok)
            return res.status(401).json({error: "In questa fase l'utente corrente non può compiere l'azione '"+DELETE_PROPOSTE+"'."});

        const proposta = await propostaController.getPropostaByID(req.params.propostaID);
        if(!proposta)
            return res.status(404).json({error: "Proposta inesistente"});

        if(!validazioneAutorizzazioneProposta(req.user, proposta))
            return res.status(401).json({ message: "Impossibile eliminare la proposta. Un utente può eliminare solo le sue proposte."});
    }
    catch(err){
        return res.status(500).json({ error: err.message });
    }
    
    try{
        await propostaController.deletePropostaByID(req.params.propostaID);
        return res.status(204).end(); 
    }
    catch(err){
        return res.status(500).json({ error: err.message });
    }
});

 
/*** API preferenze ***/
// POST /api/preferenze
app.post("/api/preferenze", isLoggedIn, validazionePreferenza, async(req, res) => {
    let ok;
    try{
        ok = await validazioneAzione(req.user, POST_PREFERENZE);
        if(!ok)
            return res.status(401).json({error: "In questa fase l'utente corrente non può compiere l'azione '"+POST_PREFERENZE+"'."});

        ok = await validazioneAutorizzazionePreferenza(req.user, req.body);
        if(!ok)
            return res.status(401).json({ message: "Impossibile esprimere la preferenza per la proposta. Un utente può esprimere preferenze solo per proposte di altri utenti."});

        const preferenze = await preferenzaController.getPreferenzeByUtenteID(req.user.utenteID);
        if(preferenze && preferenze.length!=0)
            if(preferenze.filter(p => p.propostaID==req.body.propostaID).length!=0)
                return res.status(409).json({error: "Esiste già una preferenza per questa proposta."});
    }
    catch(err){
        return res.status(500).json({ error: err.message });
    }

    try{
        ok = await preferenzaController.addPreferenza(req.body);
        return res.status(201).json(ok);
    }
    catch(err){
        return res.status(500).json({ error: err.message });
    }
});

// DELETE /api/preferenze/:preferenzaID
app.delete("/api/preferenze/:preferenzaID", isLoggedIn, async(req, res) => { 
    try{
        const preferenza = await preferenzaController.getPreferenzaByID(req.params.preferenzaID)
        if(!preferenza)
            return res.status(404).json({error: "Preferenza inesistente."});

        if(req.user.utenteID!=preferenza.utenteID)
            return res.status(401).json({ message: "Impossibile eliminare la preferenza per la proposta. Un utente può eliminare le proprie preferenze."});

        const ok = await validazioneAzione(req.user, DELETE_PREFERENZE);
        if(!ok)
            return res.status(401).json({error: "In questa fase l'utente corrente non può compiere l'azione '"+DELETE_PREFERENZE+"'."});
    }
    catch(err){
        return res.status(500).json({ error: err.message });
    }

    try{
        await preferenzaController.deletePreferenzaByID(req.params.preferenzaID);
        return res.status(204).end();
    }
    catch(err){
        return res.status(500).json({ error: err.message });
    }

});


/*** attivazione del server ***/
app.listen(port, () => {
  console.log("Server listening at http://localhost:"+port);
});
