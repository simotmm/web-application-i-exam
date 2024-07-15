import { Card, Row, Col, Badge } from "react-bootstrap";
import CaricamentoSpinner from "./CaricamentoSpinner";
import { BottoneModificaProposta, BottoneEliminaProposta } from "./PrimaFase";
import {DropdownVotazione, BottoneEliminaVoto} from "./SecondaFase"; 

function Proposta(props) {
    const indice = props.indice;
    const utente = props.utente;
    const budgetSociale = props.budgetSociale;
    const fase = budgetSociale && budgetSociale.fase;
    const proposta = props.proposta;
    let preferenza = utente && proposta && proposta.preferenze && proposta.preferenze.filter(p => p.utenteID== utente.utenteID);
    preferenza = preferenza && preferenza.length==0? null : preferenza && preferenza[0];
    const mostraUsername = props.mostraUsername;
    const mostraPreferenze = props.mostraPreferenze;
    const setMostraModaleModifica = props.setMostraModaleModifica;
    const stat = proposta.preferenze && calcolaStatistichePreferenze(proposta.preferenze);
    const modificabile = fase == 1 && utente && utente.utenteID == proposta.utenteID &&  !props.paginaDelProfilo;
    const votabile = fase==2 && utente && utente.utenteID != proposta.utenteID  && !preferenza && !props.paginaDelProfilo;
    const votoEliminabile = fase==2 && utente && utente.utenteID != proposta.utenteID && preferenza;

    if (!proposta)
        return (<CaricamentoSpinner elemento={"proposta"} />);

    return (<>
        <Card className="mb-2">
            <Card.Body>
                <Row>
                    <Col>
                        <Card.Title>Proposta #{indice+1}</Card.Title>
                        {mostraUsername && <Card.Subtitle className="mb-2 text-muted">utente: @{proposta.username}</Card.Subtitle>}
                        <Badge pill bg="primary">costo: €{parseFloat(proposta.costo).toFixed(2)}</Badge>
                        
                        {fase==2 && !votabile && !votoEliminabile && <Card.Subtitle className="mb-2 text-muted">la tua proposta</Card.Subtitle>}
                        <Card.Text>
                            Descrizione: "{proposta.descrizione}" 
                            {props.statoProposta && <><br/> Stato: {props.statoProposta}</>}
                        </Card.Text>
                        
                        {modificabile && <> <hr/> 
                            <Row>
                                <Col className='text-center'>
                                    <BottoneEliminaProposta proposta={proposta} eliminaProposta={props.eliminaProposta} indice={indice}/> 
                                </Col>
                                <Col className='text-center'>
                                    <BottoneModificaProposta indice={indice} setIndicePropostaDaModificare={props.setIndicePropostaDaModificare} setMostraModaleModifica={setMostraModaleModifica}/>
                                </Col>
                            </Row>
                        </>}
                        {votabile && <> <hr/> <DropdownVotazione utente={utente} proposta={proposta} aggiungiVoto={props.aggiungiVoto}/> </>}
                        {votoEliminabile && <div className="text-center"> <hr/> 
                            <Row>
                                <Col md={!props.paginaDelProfilo? 7: 0}>
                                    <p>Hai votato questa proposta con punteggio <strong>{preferenza.punteggio}</strong></p>
                                </Col>
                                {!props.paginaDelProfilo && <Col>
                                    <BottoneEliminaVoto utente={utente} preferenza={preferenza} eliminaVoto={props.eliminaVoto}/> 
                                </Col>}
                            </Row>
                        </div>}
                    </Col>

                    {proposta.preferenze && mostraPreferenze && <> 
                        <Col md={5}> 
                            <Card> 
                                <Card.Body>
                                    <p>
                                        <strong>Voti</strong> <br />
                                        Punteggio totale: {stat.tot}
                                        {stat.tot != 0 && <> <br />
                                            {stat.tot1>0 && <>({stat.tot1} utent{stat.tot1 == 1 ? "e" : "i"} ha{stat.tot1 == 1 ? "" : "nno"} dato 1 punto) <br /></> }
                                            {stat.tot2>0 && <>({stat.tot2} utent{stat.tot2 == 1 ? "e" : "i"} ha{stat.tot2 == 1 ? "" : "nno"} dato 2 punti) <br /></> }
                                            {stat.tot3>0 && <>({stat.tot3} utent{stat.tot3 == 1 ? "e" : "i"} ha{stat.tot3 == 1 ? "" : "nno"} dato 3 punti) <br /></> }
                                        </>}
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </>}

                </Row>
            </Card.Body>
        </Card>
    </>);
}

function calcolaStatistichePreferenze(preferenze) {
    let tot1 = 0, tot2 = 0, tot3 = 0, tot = 0;
    for (let p of preferenze) {
        switch (p.punteggio) {
            case 1: tot1++; break;
            case 2: tot2++; break;
            case 3: tot3++; break;
            default: break;
        }
        tot += p.punteggio;
    }
    return { tot: tot, tot1: tot1, tot2: tot2, tot3: tot3 };
}

export default Proposta;