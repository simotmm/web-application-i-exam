
import {React, useState} from 'react';
import Button from "react-bootstrap/Button"
import { Link } from 'react-router-dom';
import { Row, Col, Modal, Card, Form, InputGroup, FloatingLabel } from 'react-bootstrap';
import MyFooter from './MyFooter.jsx';
import "../App.css"
import API from "../API.mjs";
import CaricamentoSpinner from './CaricamentoSpinner.jsx';
const ADMIN = -1;

function Home(props) {
    const [mostraModaleIstruzioni, setMostraModaleIstruzioni] = useState(false);
    const utente = props.utente;
    const budgetSociale = props.budgetSociale;
    const setBudgetSociale = props.setBudgetSociale;
    const setMessage = props.setMessage;

    const updateBudgetSociale = async(nuovoBudgetSociale) => { 
        try{
            const budget = await API.patchBudgetSociale(nuovoBudgetSociale);
            setBudgetSociale(budget);
            if(nuovoBudgetSociale.fase==1)
                setMessage({msg: "Budget sociale impostato (€"+nuovoBudgetSociale.budget+"), fase 0 terminata con successo.", type: "success"});
            else if(nuovoBudgetSociale.fase==0)
                setMessage({msg: "Processo riavviato con successo, fase attuale: 0, budget: azzerato.", type: "success"});
            else
                setMessage({msg: "Fase "+(nuovoBudgetSociale.fase-1)+" terminata con successo.", type: "success"});
        }
        catch(err){
            return err;
        }
    }

    const controllaAggiornamento = async() => { //sostituisce la funzione di refresh della pagina, aggiorna lo stato a un utente se un admin ha aggiornato la fase
        const budgetSocialeAggiornato = await API.getBudgetSociale();
        let messaggio;
        if(budgetSocialeAggiornato.fase!=budgetSociale.fase){
            let tipoMessaggio = "success";
            let messaggio;
            if(utente){
                messaggio = "La fase è stata aggiornata (fase "+budgetSociale.fase+" -> fase "+budgetSocialeAggiornato.fase+").";
            }
            else{
                if(budgetSocialeAggiornato.fase==3)
                    messaggio = "La fase è stata aggiornata.";
                else{
                    messaggio = "La fase non è stata aggiornata.";
                    tipoMessaggio = "primary";
                }
            }
            setMessage({msg: messaggio, type: tipoMessaggio});
            props.setBudgetSociale(budgetSocialeAggiornato);
        }
        else{
            messaggio="La fase non è"+(utente && budgetSociale.fase!=3? " ancora ": " ")+"stata aggiornata";
            if(utente)
                messaggio+=" (fase attuale: fase "+budgetSociale.fase+")";
            messaggio+=".";
            setMessage({msg: messaggio, type: "primary"});
        }
    }

    if (!budgetSociale)
        return (
            <CaricamentoSpinner elemento={"budget sociale"}></CaricamentoSpinner>
        );

    return (
        <>
        <Row>
            <h2 className='text-center'>Budget Sociale</h2>
            <Col></Col>

            <Col mb={9} className="justify-content-center align-items-center">
                <CardHome budgetSociale={budgetSociale} utente={utente} updateBudgetSociale={updateBudgetSociale}></CardHome>

                <Row className='justify-content-center align-items-center text-center'>
                    
                    {(!utente || (utente && utente.tipo!=ADMIN)) && <Col>
                        <BottoneControllaAggiornamento controllaAggiornamento={controllaAggiornamento}/></Col>
                    }
                    
                    <Col className="justify-content-center align-items-center text-center">
                        
                        <Button variant="primary" onClick={() => setMostraModaleIstruzioni(true)}>
                            Funzionamento del sito
                        </Button>
                        <ModaleIstruzioni
                            utente={utente}
                            show={mostraModaleIstruzioni}
                            onHide={() => setMostraModaleIstruzioni(false)}
                        >
                        </ModaleIstruzioni>
                    </Col>
                </Row>
            </Col>
            <Col></Col>
            <MyFooter></MyFooter>
        </Row>
        
    </>);
}

function CardHome(props) {
    const [mostraModaleDefinisciBudget, setMostraModaleDefinisciBudget] = useState(false);
    const budgetSociale = props.budgetSociale;
    const fase = budgetSociale.fase;
    const utente = props.utente;
    let titoli = ["Fase preliminare", //titoli card per admin e utenti loggati
                  "Fase di definizione delle proposte", 
                  "Fase di votazione delle proposte", 
                  "Fase finale"];
    const titoliUtentiNonLoggati = ["Fase di definizione delle proposte",
                                    "Fase di definizione delle proposte",
                                    "Fase di definizione delle proposte",
                                    "Fase di visualizzazione delle proposte"];
    const testiAdmin = ["Fase 0: definire il budget per passare alla fase 1.",
                        "Fase 1: definire un massimo di tre proposte o terminare la fase 1 per passare alla fase 2.",
                        "Fase 2: esprimere le preferenze per le proposte o terminare la fase 2 per passare alla fase 3.",
                        "Fase 3: visualizza le proposte approvate e non approvate oppure riavvia il processo per tornare alla fase 0."];
    const testiUtenti = ["La fase di definizione delle proposte è ancora chiusa.",
                         "La fase di definizione delle proposte è aperta, è possibile definire un massimo di tre proposte.",
                         "La fase di votazione delle proposte è aperta, è possibile esprimere un numero illimitato di preferenze per le proposte.",
                         "La fase di votazione delle proposte è chiusa, è possibile visualizzare le proposte approvate e non approvate."];
    const testiUtentiNonLoggati = ["La fase di definizione delle proposte è in corso.",
                                   "La fase di definizione delle proposte è in corso.",
                                   "La fase di definizione delle proposte è in corso.",
                                   "La fase di definizione delle proposte è terminata, è possibile visualizzare le proposte approvate."];

    titoli = !utente ? titoliUtentiNonLoggati : titoli;
    let testi;
    if (!utente)
        testi = testiUtentiNonLoggati;
    else
        testi = utente.tipo == ADMIN ? testiAdmin : testiUtenti;

    return (
        <Card className='mb-2'>
            <Card.Body>
                <Card.Title>{titoli[fase]}</Card.Title>                     {/** per mostrare sempre due cifre decimali**/}
                {fase!=0 && utente && utente.tipo==ADMIN && <div>(Budget: €{parseFloat(budgetSociale.budget).toFixed(2)})</div>} 
                <Card.Text>
                    { testi && testi.length>fase && testi[fase]}
                    <br/> <br/> <br/> <br/>
                </Card.Text> 
                {((utente && utente.tipo==ADMIN) || (utente && utente.tipo!=ADMIN && fase>=1) || !utente) && <> <hr/> {/** barra di demarcazione e Row nel caso in cui ci siano bottoni da mostrare **/}
                <Row>
                    
                    {utente && utente.tipo==ADMIN && fase==3  && (<>
                        <Col className='text-center'> 
                            <BottoneRiavvia budgetSociale={budgetSociale} updateBudgetSociale={props.updateBudgetSociale} />
                        </Col>
                    </>)}
                    

                    <Col className='text-center'>
                        {!utente && fase!=3 && <BottoneAccedi />} {/* bottone per utente non loggato */}
                        {/* bottoni per utente loggato non admin */}
                        {utente && fase==1 && <BottoneDefinisciProposte/>}
                        {utente && fase==2 && <BottoneEsprimiPreferenze/>}
                        {fase==3 && <BottoneVisualizzaProposte/>} {/* bottone per tutti i tipi di utenti */}
                        
                        {utente && utente.tipo == ADMIN && fase == 0 && <>
                            <Button variant="primary" onClick={() => setMostraModaleDefinisciBudget(true)}> {/* bottone per utente loggato admin */}
                                Definisci budget
                            </Button> 
                            <ModaleDefinisciBudget 
                                budgetSociale={budgetSociale}
                                show={mostraModaleDefinisciBudget}
                                onHide={() => setMostraModaleDefinisciBudget(false)}
                                updateBudgetSociale={props.updateBudgetSociale} >
                            </ModaleDefinisciBudget>
                        </>}
                    </Col>

                    {utente && utente.tipo == ADMIN && fase>0 && fase<3 &&  <>
                        <Col className='text-center'>
                            <BottoneAvanzamento budgetSociale={budgetSociale} updateBudgetSociale={props.updateBudgetSociale}/> 
                        </Col>
                    </>}
                    
                </Row></>}
            </Card.Body>
        </Card>
    );
}

function BottoneControllaAggiornamento(props){
    return (
        <Button variant="primary" className="text-white mt-2 mb-2" onClick={ () => props.controllaAggiornamento() }>Controlla aggiornamento fase</Button>
    );
}

function BottoneDefinisciProposte(){
    return (
        <Button as={Link} to="/fase1" variant="primary" className="text-white mb-2">Definisci proposte</Button>
    );
}      
       
function BottoneEsprimiPreferenze(){
    return (
        <Button as={Link} to="/fase2" variant="primary" className="text-white mb-2">Esprimi preferenze</Button>
    );
}

function BottoneVisualizzaProposte(){
    return (
        <Button as={Link} to="/fase3" variant="primary" className="text-white">Visualizza proposte</Button>
    );
}

function BottoneAvanzamento(props) {
    const handleClick = async () => {
        const nuovoBudgetSociale = { ...props.budgetSociale, fase: props.budgetSociale.fase+1 };
        try {
            await props.updateBudgetSociale(nuovoBudgetSociale);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Button variant="primary" onClick={handleClick}>
            Passa alla fase {props.budgetSociale.fase+1}
        </Button>
    );
}

function BottoneRiavvia(props) {
    const handleClick = async () => {
        const nuovoBudgetSociale = { ...props.budgetSociale, budget: 0, fase: 0 };
        try {
            await props.updateBudgetSociale(nuovoBudgetSociale);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Button variant="danger" onClick={handleClick}>
            Riavvia Processo
        </Button>
    );
}

function BottoneAccedi(){
    return (
        <Button as={Link} to="/accedi" variant="primary" className="text-white">Accedi</Button>
    );
}

function ModaleDefinisciBudget(props) {
    const [budget, setBudget] = useState(0.0);
    const budgetSociale = props.budgetSociale;

    const handleSubmit = async (event) => {
        event.preventDefault();                                //si mantengono le prime due cifre decimali dopo la virgola
        const nuovoBudgetSociale = { ...budgetSociale, budget: parseFloat(budget).toFixed(2), fase: budgetSociale.fase + 1 }; 
        try {
            await props.updateBudgetSociale(nuovoBudgetSociale);
            props.onHide(); // per chiudere il modale
        } catch (err) {
            return err;
        }
    };

    return (
        <Modal
            show={props.show}
            onHide={props.onHide}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">Definisci il budget</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <FloatingLabel controlId="budget" className="mb-3">
                        <InputGroup>
                            <InputGroup.Text>€</InputGroup.Text>
                            <Form.Control 
                                type="number" 
                                min="0.01"
                                step="0.01"
                                onChange={ev => setBudget(ev.target.value)} 
                                required 
                            />
                        </InputGroup>
                    </FloatingLabel>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" type="submit">Salva e passa alla fase 1</Button>
                    <Button variant="secondary" onClick={props.onHide}>Annulla</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}


function ModaleIstruzioni(props) {
    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered>
            <Modal.Header closeButton>  
                <Modal.Title id="contained-modal-title-vcenter">Budget Sociale</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h5>Funzionamento del sito</h5>
                <p>
                    Lo scopo è definire un budget e allocarlo in iniziative proposte e votate dagli utenti registrati. <br/>
                    Il processo si divide in più fasi e coinvolge diversi tipi di utenti. <br/><br/> 

                    <strong>Fase 0 (definizione budget): </strong> 
                     l'utente amministratore definisce il budget, tutti gli altri utenti non possono compiere nessun'azione. <br/><br/>

                    <strong>Fase 1 (definizione proposte): </strong> 
                     gli utenti registrati possono proporre un massimo di tre iniziative con rispettivi costi, 
                     inoltre possono visualizzare, modificare ed eliminare le proprie proposte (è possibile visualizzare solo le proprie proposte). 
                     Gli utenti non registrati non possono compiere nessun'azione. <br/><br/>

                    <strong>Fase 2 (votazione proposte): </strong> 
                     gli utenti registrati possono visualizzare le proposte degli altri utenti e votarle,
                     inoltre possono visualizzare ed eliminare i propri voti (non è possibile votare le proprie proposte). 
                     Gli utenti non registrati non possono compiere nessun'azione. <br/><br/>

                    <strong>Fase 3 (visualizzazione proposte): </strong>
                     in questa fase è possibile visualizzare tutte le proposte approvate, cioè tutte le proposte più votate la cui somma cumulativa dei costi
                     rientra nel budget definito; le proposte approvate riportano anche il nome dell'utente che ha fatto la proposta.
                     Gli utenti registrati possono visualizzare anche le proposte non approvate, ma il nome dell'utente non verrà mostrato. <br/><br/>
                    
                    <strong>Riavvio: </strong>Durante la fase 3 l'utente amministratore può tornare alla fase 0, 
                     azzerando il budget definito ed eliminando automaticamente tutte le proposte e i relativi voti.
                </p>
            </Modal.Body>
            <Modal.Footer>
                {!props.utente && <BottoneAccedi></BottoneAccedi>}
                <Button onClick={props.onHide}>Chiudi</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default Home;