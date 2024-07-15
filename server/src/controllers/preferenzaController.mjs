import PreferenzaDAO from "../dao/preferenzaDAO.mjs";

export default function PreferenzaController(){
    
    const preferenzaDAO = new PreferenzaDAO();

    this.getPreferenzaByID = async(preferenzaID) => {
        return await preferenzaDAO.getPreferenzaByID(preferenzaID);
    }

    this.getPreferenzeByPropostaID = async(propostaID) => {
        return await preferenzaDAO.getPreferenzeByPropostaID(propostaID);
    } 

    this.getPreferenzeByUtenteID = async(utenteID) => {
        return await preferenzaDAO.getPreferenzeByUtenteID(utenteID);
    } 

    this.addPreferenza = async(preferenza) => {
        return await preferenzaDAO.addPreferenza(preferenza.utenteID, preferenza.propostaID, preferenza.punteggio);
    };

    this.deletePreferenzaByID = async(preferenzaID) => {
        return await preferenzaDAO.deletePreferenzaByID(preferenzaID);
    };

}