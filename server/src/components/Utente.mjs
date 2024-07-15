export default function Utente(utenteID, username, tipo, proposte, preferenze){
    this.utenteID = utenteID;
    this.username = username;
    this.tipo = tipo;

    this.toJSON = () => {
        return { ...this };
    }
}

