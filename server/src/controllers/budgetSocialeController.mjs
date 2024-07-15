import BudgetSocialeDAO from "../dao/budgetSocialeDAO.mjs";
import PropostaController from "./propostaController.mjs";
import {iniziaTransazione, annullaTransazione, concludiTransazione} from "../db/db.mjs";

export default function BudgetSocialeController(){

    const budgetSocialeDAO = new BudgetSocialeDAO();
    const propostaController = new PropostaController();

    this.getBudgetSociale = async() => {
        return await budgetSocialeDAO.getBudgetSociale();
    };

    this.updateBudgetSociale = async(budgetSociale) => {
        let ok;
        try{
            
            ok = await iniziaTransazione();
            if(!ok) return ok;

            ok = await budgetSocialeDAO.updateBudgetSociale(budgetSociale.budget, budgetSociale.fase);
            if(!ok) return await annullaTransazione();

            if(budgetSociale.fase==0){
                ok = await propostaController.deleteAll();
                if(!ok) return await annullaTransazione();
            }
                
            if(budgetSociale.fase==3){
                let proposte = await propostaController.getProposte();
                if(!proposte) return await annullaTransazione();
                
                for(let proposta of proposte)
                    proposta.punteggio = proposta.preferenze.reduce((somma, preferenza) => somma+preferenza.punteggio, 0);
                
                proposte.sort((a, b) => b.punteggio-a.punteggio);

                let sommaCumulativa = 0;
                const budget = budgetSociale.budget;
                let continuaApprovazioni = true;
                for(let proposta of proposte){
                    if(continuaApprovazioni && proposta.costo+sommaCumulativa<=budget){
                        sommaCumulativa+=proposta.costo;
                        proposta.approvata=1;
                    } //l'ordine di preferenza deve essere rispettato, alla prima proposta non approvata tutte le successive saranno non approvate
                    else{ //per mantenere l'ordine di preferenza, in caso contrario potrebbero essere approvate proposte più in basso in classifica (ma che rientrano nel budget)
                        if(continuaApprovazioni)
                            continuaApprovazioni=false;
                        proposta.approvata=0;
                        proposta.username=null;
                    }
                    ok = await propostaController.setApprovazioneProposta(proposta.punteggio, proposta.approvata, proposta.propostaID);
                    if(!ok) return await annullaTransazione();
                }
            }   
            ok = await concludiTransazione();
            if(!ok) return ok;
            return true;
        }
        catch(err){
            return err;
        }
    }
}