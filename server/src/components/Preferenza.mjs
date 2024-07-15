export default function Preferenza(preferenzaID, utenteID, propostaID, punteggio){
    this.preferenzaID = preferenzaID;
    this.utenteID = utenteID;
    this.propostaID = propostaID;
    this.punteggio = punteggio;

    this.toJSON = () => {
        return { ...this };
    }
}