export default function Proposta(propostaID, utenteID, username, descrizione, costo, preferenze, punteggio, approvata){
    this.propostaID = propostaID;
    this.utenteID = utenteID;
    this.username = username;
    this.descrizione = descrizione;
    this.costo = costo;
    this.punteggio = punteggio;
    this.approvata = approvata;
    this.preferenze = preferenze;

    this.toJSON = () => {
        return { ...this };
    }
}