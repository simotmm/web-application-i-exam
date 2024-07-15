import UtenteDAO from "../dao/utenteDAO.mjs";

export default function UtenteController(){

    const utenteDAO = new UtenteDAO();

    this.getUtente = async(username, password) => {
        return await utenteDAO.getUtente(username, password);
    }

    this.getUtenteByUsername = async(username) => {
        return await utenteDAO.getUtenteByUsername(username);
    }

    this.addUtente = async (username, password) => {
        return await utenteDAO.addUtente(username, password);
    };
    
}