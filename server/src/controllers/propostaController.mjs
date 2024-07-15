import PropostaDAO from "../dao/propostaDAO.mjs";
import PreferenzaDAO from "../dao/preferenzaDAO.mjs";
import BudgetSocialeDAO from "../dao/budgetSocialeDAO.mjs";

export default function PropostaController(){

    const propostaDAO = new PropostaDAO();
    const preferenzaDAO = new PreferenzaDAO();
    const budgetSocialeDAO = new BudgetSocialeDAO();

    this.getProposteByUtenteID = async(utenteID) => {
        let proposte = await propostaDAO.getProposteByUtenteID(utenteID);
        if(!proposte) return proposte;

        for(let proposta of proposte){
            let preferenze = await preferenzaDAO.getPreferenzeByPropostaID(proposta.propostaID);
            if(!preferenze) return preferenze;
            proposta.preferenze = preferenze;
        }

        return proposte;
    };

    this.getProposte = async(utente) => {
        let proposte = await propostaDAO.getProposte();
        if(!proposte) return proposte;
        let budgetSociale = await budgetSocialeDAO.getBudgetSociale();
        if(!budgetSociale) return budgetSociale;

        for(let proposta of proposte){
            let preferenze = await preferenzaDAO.getPreferenzeByPropostaID(proposta.propostaID);
            if(!preferenze) return preferenze;      
            proposta.preferenze = budgetSociale.fase==2? preferenze.filter(p => p.utenteID==utente.utenteID) : preferenze;
        } //durante la fase 2 l'utente riceve solo le proprie preferenze (il client fa comunque un controllo e non le mostra ma serebbero visibili tramite chiamata api)

        return proposte;
    }

    this.getProposteFaseFinale = async() => {
        let proposte = await this.getProposte();
        if(!proposte) return proposte;
        
        proposte.sort((a, b) => b.punteggio-a.punteggio);

        let approvate = [];
        let nonApprovate = [];

        for(let proposta of proposte)
            if(proposta.approvata==1)
                approvate.push(proposta);
            else
                nonApprovate.push(proposta);

        return {proposteApprovate: approvate, proposteNonApprovate: nonApprovate};
    }

    this.getPropostaByID = async(propostaID) => {
        let proposta = await propostaDAO.getPropostaByID(propostaID);
        if(!proposta) return proposta;

        const preferenze = await preferenzaDAO.getPreferenzeByPropostaID(proposta.propostaID);
        if(!preferenze) return preferenze;
        proposta.preferenze = preferenze;

        return proposta;
    }

    this.addProposta = async(proposta) => {
        return await propostaDAO.addProposta(proposta.utenteID, proposta.descrizione, proposta.costo);
    };

    this.updatePropostaByID = async(proposta) => {
        return await propostaDAO.updatePropostaByID(proposta.propostaID, proposta.descrizione, proposta.costo);
    };

    this.setApprovazioneProposta = async(punteggio, approvazione, propostaID) => {
        return await propostaDAO.setApprovazioneProposta(punteggio, approvazione, propostaID);
    }

    this.deletePropostaByID = async(propostaID) => {
        return await propostaDAO.deletePropostaByID(propostaID);
    };

    this.deleteAll = async() => {
        return await propostaDAO.deleteAll();
    }

}