import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Row, Col, Button, Modal, Form, FloatingLabel, InputGroup } from "react-bootstrap";
import Proposta from "./Proposta";
import API from "../API.mjs";
import CaricamentoSpinner from "./CaricamentoSpinner";

function PrimaFase(props) {
    const utente = props.utente;
    const budgetSociale = props.budgetSociale;
    const setMessage = props.setMessage;
    const [proposte, setProposte] = useState(null);
    const [mostraModaleAggiunta, setMostraModaleAggiunta] = useState(false);
    const [mostraModaleModifica, setMostraModaleModifica] = useState(false);
    const [indicePropostaDaModificare, setIndicePropostaDaModificare] = useState(null);
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
            if(budgetSocialeAggiornato && budgetSocialeAggiornato.fase!=1){
                props.setBudgetSociale(budgetSocialeAggiornato);
                setMessage({msg: "Accesso non autorizzato. Fase corrente: "+budgetSociale.fase+". Impossibile accedere alla schermata della fase 1.", type: "danger"});
                navigate("/");
                return false;
            }
            return true;
        };
        
        const getProposte = async() => {
            try {
                const proposte = await API.getProposteByUtenteID(utente && utente.utenteID);
                setProposte(proposte);
            } catch(err) {
                return err;
            }
        }
        if(ok && checkFase())
            getProposte();
    }, []); // useEffect attivato ogni volta che si accede al componente

    const checkOperazione = async(operazione) => {
        try{
            const budgetSocialeAggiornato = await API.getBudgetSociale();
            const fase = budgetSocialeAggiornato.fase;
            if(fase!=1){
                setMessage({msg: "Impossibile completare l'operazione (operazione di "+operazione+" consentita durante la fase 1, fase corrente: fase "+fase+").", type: "danger"});
                props.setBudgetSociale(budgetSocialeAggiornato);
                navigate("/errore");
            }
        }
        catch(err){
            return err;
        }
    }

    const aggiungiProposta = async(nuovaProposta) => {
        try {
            await checkOperazione("aggiunta proposta");
            
            const nuovoID = await API.postProposta(nuovaProposta);
            setProposte(proposte => {
                let proposteAggiornate = [...proposte];
                proposteAggiornate.push({...nuovaProposta, propostaID: nuovoID});
                return proposteAggiornate;
            });
            setMessage({ msg: "Proposta salvata correttamente.", type: "success" });
        }
        catch (err) {
            return err;
        }
    };

    const modificaProposta = async(propostaAggiornata, indice) => {
        try {
            await checkOperazione("modifica proposta");

            await API.patchProposta(propostaAggiornata);
            setProposte(proposte => {
                let proposteAggiornate = [...proposte];
                proposteAggiornate[indice] = propostaAggiornata;
                return proposteAggiornate;
            });
            setMessage({ msg: "Proposta #"+(indice+1)+" modificata correttamente.", type: "success" });
        }
        catch (err) {
            return err;
        }
    }

    const eliminaProposta = async(proposta, indice) => {
        try{
            await checkOperazione("eliminazione proposta");

            await API.deleteProposta(proposta.propostaID);
            setProposte(proposte => {
                let proposteAggiornate = [];
                for(let i=0; i<proposte.length; i++)
                    if(i!=indice)
                        proposteAggiornate.push(proposte[i]);
                return proposteAggiornate;
            });
            setMessage({ msg: "Proposta #"+(indice+1)+" eliminata correttamente.", type: "primary" });
        }
        catch(err){
            return err;
        }
    }

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
                <h4>Fase di definizione delle proposte</h4>
                <p>Budget: €{parseFloat(budgetSociale.budget).toFixed(2)}</p> <br />

                {proposte && proposte.length==0 && <>
                    <p>Non hai ancora inserito nessuna proposta.</p> 
                    <div className="text-center">
                        <BottoneAggiungiProposta setMostraModaleAggiunta={setMostraModaleAggiunta} />
                    </div>
                </>} 
                
                {proposte && proposte.length > 0 && <p>Le mie proposte</p> }
                {proposte && proposte.length > 0 && proposte.map((proposta, index) => (
                    <Proposta
                        key={proposta.propostaID+"fase1"} /** key unica per il componente proposta **/
                        proposta={proposta}
                        indice={index}
                        utente={utente}
                        budgetSociale={budgetSociale}
                        setMostraModaleModifica={setMostraModaleModifica} 
                        setIndicePropostaDaModificare={setIndicePropostaDaModificare}
                        eliminaProposta={eliminaProposta}
                    />
                )
                )}
            </Col>

            <Col>
                {proposte && proposte.length>0 && proposte.length<3 && <>
                    <GapVerticale/>
                    <BottoneAggiungiProposta setMostraModaleAggiunta={setMostraModaleAggiunta} />
                </>}
            </Col>
        </Row>

        <ModaleAggiungiProposta
            utente={utente}
            budgetSociale={budgetSociale}
            aggiungiProposta={aggiungiProposta}
            show={mostraModaleAggiunta}
            onHide={() => setMostraModaleAggiunta(false)}
        />

        <ModaleModificaProposta
            utente={utente}
            budgetSociale={budgetSociale}
            proposta={proposte && proposte[indicePropostaDaModificare]}
            indice={indicePropostaDaModificare}
            modificaProposta={modificaProposta}
            show={mostraModaleModifica}
            onHide={() => setMostraModaleModifica(false)}
            setMessage={setMessage}
        />
    </>);
}

function ModaleAggiungiProposta(props) {
    const [descrizione, setDescrizione] = useState("");
    const [costo, setCosto] = useState(0.0);
    const proposta = {
        propostaID: null,
        utenteID: props.utente.utenteID,
        descrizione: "",
        costo: 0.0,
        preferenze: null
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const nuovaProposta = {
            ...proposta,
            descrizione: descrizione,
            costo: parseFloat(costo).toFixed(2)
        };
        try {
            await props.aggiungiProposta(nuovaProposta);
            setDescrizione("");
            setCosto(0.0);
            props.onHide();
        }
        catch (err) {
            return err;
        }
    };

    return (
        <Modal show={props.show} onHide={props.onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Inserisci proposta</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <FloatingLabel controlId="descrizione" label="descrizione" className="mb-3">
                        <Form.Control type="text" maxLength={60} placeholder="descrizione" value={descrizione} onChange={ev => setDescrizione(ev.target.value)} required={true} />
                    </FloatingLabel>

                    <div>Costo</div>
                    <InputGroup>    
                        <InputGroup.Text>€</InputGroup.Text>
                            <Form.Control
                                type="number"
                                min="0.01"
                                max={props.budgetSociale.budget}
                                step="0.01"
                                onChange={ev => setCosto(ev.target.value)}
                                required
                                id="costo"
                            />
                    </InputGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" type="submit">Salva proposta</Button>
                    <Button variant="secondary" onClick={props.onHide}>Annulla</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

function ModaleModificaProposta(props) {
    const proposta = props.proposta;
    const indice = props.indice;
    const [descrizione, setDescrizione] = useState("");
    const [costo, setCosto] = useState(0.0);
    const [datiInizialiImpostati, setDatiInizialiImpostati] = useState(false);

    useEffect( () => {
        const impostaDatiIniziali = () =>{
            setDescrizione(proposta.descrizione);
            setCosto(proposta.costo);
            setDatiInizialiImpostati(true);
        }
        if(proposta && !datiInizialiImpostati)
            impostaDatiIniziali();
    }, [proposta, props.show]); //nell'istante in cui viene caricato il componente l'oggetto proposta è null,
    // la funzione nello useEffect viene chiamata una volta quando proposta diventa !=null e ogni volta che il modale si apre

    useEffect(() => {
        if (!props.show) {
            setDescrizione("");
            setCosto(0.0);
            setDatiInizialiImpostati(false);
        }
    }, [props.show]); // reset dei dati quando il modale viene chiuso

    const handleSubmit = async (event) => {
        event.preventDefault();
        const nuovaProposta = {
            ...proposta,
            descrizione: descrizione,
            costo: parseFloat(costo).toFixed(2)
        };
        try {
            if(nuovaProposta.descrizione==proposta.descrizione && nuovaProposta.costo==proposta.costo)
                props.setMessage({msg: "I dati inseriti sono uguali ai precedenti, nessuna modifica apportata alla proposta #"+(indice+1)+".", type: "primary"});
            else
                await props.modificaProposta(nuovaProposta, props.indice);
            props.onHide();
        }
        catch (err) {
            return err;
        }
    };

    return (
        <Modal show={props.show} onHide={props.onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Modifica proposta</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <FloatingLabel controlId="descrizione" label="descrizione" className="mb-3">
                        <Form.Control type="text" maxLength={60} value={descrizione} onChange={ev => setDescrizione(ev.target.value)} required={true} />
                    </FloatingLabel>

                    <div>Costo</div>
                    <InputGroup>
                        <InputGroup.Text>€</InputGroup.Text>
                        <Form.Control
                            type="number"
                            min="0.01"
                            max={props.budgetSociale.budget}
                            value={costo}
                            step="0.01"
                            onChange={ev => setCosto(ev.target.value)}
                            required={true}
                            id="costo"
                        />
                    </InputGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" type="submit">Salva modifiche</Button>
                    <Button variant="secondary" onClick={props.onHide}>Annulla</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

function BottoneAggiungiProposta(props) {
    return (
        <Button variant="primary" onClick={() => props.setMostraModaleAggiunta(true)}>
            Aggiungi Proposta
        </Button>
    );
}

function BottoneModificaProposta(props) {
    return (
        <Button variant="primary" onClick={() => { props.setIndicePropostaDaModificare(props.indice); props.setMostraModaleModifica(true) }}>
            Modifica Proposta
        </Button>
    );
}

function BottoneEliminaProposta(props) {
    return (
        <Button variant="danger" onClick={() => props.eliminaProposta(props.proposta, props.indice)}>
            Elimina Proposta
        </Button>
    );
}

function GapVerticale(){
    return (<><br/><br/><br/><br/><br/><br/></>);
}

function BottoneHome() {
    return (
        <Button mb={3} as={Link} to="/" variant="primary" className="text-white mb-2 me-4">Torna alla home</Button>
    );
}

export { PrimaFase, BottoneModificaProposta, BottoneEliminaProposta };
