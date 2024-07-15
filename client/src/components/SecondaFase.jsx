import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Row, Col, Button, Modal, Form, FloatingLabel, InputGroup, Dropdown, ButtonGroup } from "react-bootstrap";
import Proposta from "./Proposta";
import API from "../API.mjs";
import CaricamentoSpinner from "./CaricamentoSpinner";

function SecondaFase(props) {
    const utente = props.utente;
    const budgetSociale = props.budgetSociale;
    const setMessage = props.setMessage;
    const [proposte, setProposte] = useState(null);
    const navigate = useNavigate();
    
    useEffect(() => {

        let ok=true;
        if(!utente){
            ok=false;
            setMessage({msg: "Accesso non autorizzato. Effettuare il login.", type: "danger"});
            navigate("/");
        }
        
        const checkFase = async() => { // necessario nel caso in cui un admin cambi la fase e un utente dalla home clicchi sul tasto per accedere alla pagina (oppure per accesso tramite url)
            const budgetSocialeAggiornato = await API.getBudgetSociale();
            if(budgetSocialeAggiornato && budgetSocialeAggiornato.fase!=2){
                props.setBudgetSociale(budgetSocialeAggiornato);
                setMessage({msg: "Accesso non autorizzato. Fase corrente: "+budgetSociale.fase+". Impossibile accedere alla schermata della fase 2.", type: "danger"});
                navigate("/");
                return false;
            }
            return true;
        };

        const getProposte = async() => {
            try {
                const proposte = await API.getProposte();
                setProposte(proposte);
            } catch (err) {
                return err;
            }
        }
        if(ok && checkFase())
            getProposte();
    }, []); 

    const checkOperazione = async(operazione) => {
        try{
            const budgetSocialeAggiornato = await API.getBudgetSociale();
            const fase = budgetSocialeAggiornato.fase;
            if(fase!=2){
                setMessage({msg: "Impossibile completare l'operazione (operazione di "+operazione+" consentita durante la fase 2, fase corrente: fase "+fase+").", type: "danger"});
                props.setBudgetSociale(budgetSocialeAggiornato);
                navigate("/errore");
            }
        }
        catch(err){
            return err;
        }
    }

    const aggiungiVoto = async(preferenza) => {
        try {
            await checkOperazione("votazione");

            const nuovoID = await API.postPreferenza(preferenza);
            setProposte(proposte => {
                let proposteAggiornate = [...proposte];
                proposteAggiornate = proposteAggiornate.map(proposta => {
                    if (proposta.propostaID==preferenza.propostaID) {
                        return {...proposta,
                            preferenze: [...proposta.preferenze, { ...preferenza, preferenzaID: nuovoID }]
                        };
                    }
                    return proposta;
                });
                return proposteAggiornate;
            });
            setMessage({ msg: "Proposta votata correttamente con punteggio "+preferenza.punteggio+".", type: "success" });
        }
        catch (err) {
            return err;
        }
    };

    const eliminaVoto = async(preferenzaDaEliminare) => {
        try {
            await checkOperazione("eliminazione voto");

            await API.deletePreferenza(preferenzaDaEliminare);
            setProposte(proposte => {
                let proposteAggiornate = [...proposte];
                proposteAggiornate = proposteAggiornate.map(proposta => {
                    if (proposta.propostaID==preferenzaDaEliminare.propostaID) {
                        return {...proposta, 
                            preferenze: proposta.preferenze.filter(
                                preferenza => preferenza.preferenzaID!=preferenzaDaEliminare.preferenzaID)};
                    }
                    return proposta;
                });
                return proposteAggiornate;
            });
            setMessage({ msg: "Voto eliminato correttamente.", type: "primary" });
        }
        catch (err) {
            return err;
        }
    };

    if (!proposte || !budgetSociale)
        return (<CaricamentoSpinner elemento={"proposte"} />);

    return (<>
        <Row>
            <h2 className='text-center'>Budget Sociale</h2>

            <Col className="text-end">
                <GapVerticale/>
                <BottoneHome/>
            </Col>

            <Col md={5}>
                <h4>Fase di votazione delle proposte</h4>
                <p>Budget: €{parseFloat(budgetSociale.budget).toFixed(2)}</p> <br />

                {proposte && proposte.length==0 && <p>Non c'è nessuna proposta da votare.</p>} 

                {proposte && proposte.length>0 && proposte.map((proposta, index) => (
                    <Proposta
                        key={proposta.propostaID+"fase2"} /** key unica per il componente proposta **/
                        proposta={proposta}
                        indice={index}
                        utente={utente}
                        budgetSociale={budgetSociale}
                        aggiungiVoto={aggiungiVoto}
                        eliminaVoto={eliminaVoto}
                    />)
                )}
            </Col>

            <Col>
            </Col>
        </Row>

        
    </>);
}

function DropdownVotazione(props) {
    const preferenza = {
        preferenzaID: null, 
        utenteID: props.utente.utenteID, 
        propostaID: props.proposta.propostaID, 
        punteggio: 0
    };
    return (
       <Dropdown className="text-center">
            <Dropdown.Toggle variant="primary">
                Vota proposta
            </Dropdown.Toggle>
            <Dropdown.Menu className="text-center">
                <p>dai un punteggio</p>
                <ButtonGroup>
                    <Button onClick={() => props.aggiungiVoto({...preferenza, punteggio: 1})}> 1 </Button>
                    <Button onClick={() => props.aggiungiVoto({...preferenza, punteggio: 2})}> 2 </Button>
                    <Button onClick={() => props.aggiungiVoto({...preferenza, punteggio: 3})}> 3 </Button>
                </ButtonGroup>
            </Dropdown.Menu>
       </Dropdown>
    );
}

function BottoneEliminaVoto(props) {
    return (
        <Button variant="danger" onClick={() => props.eliminaVoto(props.preferenza)}>
            Elimina Voto
        </Button>
    );
}

function GapVerticale(){
    return (<><br/><br/><br/><br/><br/></>);
}

function BottoneHome() {
    return (
        <Button mb={3} as={Link} to="/" variant="primary" className="text-white mb-2 me-4">Torna alla home</Button>
    );
}

export { SecondaFase, DropdownVotazione, BottoneEliminaVoto };
