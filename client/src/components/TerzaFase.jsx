import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../API.mjs";
import CaricamentoSpinner from "./CaricamentoSpinner";
import { Row, Col, Button} from "react-bootstrap";
import Proposta from "./Proposta";

function TerzaFase(props){
    const utente = props.utente;
    const budgetSociale = props.budgetSociale;
    const setMessage = props.setMessage;
    const [proposteApprovate, setProposteApprovate] = useState(null);
    const [proposteNonApprovate, setProposteNonApprovate] = useState(null);
    const navigate = useNavigate();
    
    useEffect(() => {

        const checkFase = async() => { // necessario nel caso in cui un admin cambi la fase e un utente dalla home clicchi sul tasto per accedere alla pagina (oppure per accesso tramite url)
            const budgetSocialeAggiornato = await API.getBudgetSociale();
            if(budgetSocialeAggiornato && budgetSocialeAggiornato.fase!=3){
                props.setBudgetSociale(budgetSocialeAggiornato);
                let messaggio = "Accesso non autorizzato.";
                if(utente)
                    messaggio+=" Fase corrente: "+budgetSociale.fase+". Impossibile accedere alla schermata della fase 3."
                setMessage({msg: messaggio, type: "danger"});
                navigate("/");
                return false;
            }
            return true;
        };

        const getProposte = async() => {
            try{
                const proposte = await API.getProposteFaseFinale();
                setProposteApprovate(proposte.proposteApprovate);
                if(utente && utente.utenteID)
                    setProposteNonApprovate(proposte.proposteNonApprovate);
            }   
            catch(err){
                return err;
            }
        }
        if(checkFase())
            getProposte();
    }, []);

    if (!proposteApprovate || !budgetSociale)
        return (<CaricamentoSpinner elemento={"proposte approvate"} />);

    return (<>
        <Row>
            <h2 className="text-center">Budget Sociale</h2>

            <Col className="text-end">
                <GapVerticale></GapVerticale>
                <BottoneHome/>
            </Col>

            <Col md={6}>
                <h3>Fase di visualizzazione delle proposte</h3>
                <p>Budget: €{parseFloat(budgetSociale.budget).toFixed(2)}</p> 
                <br/>
    
                <h4>Proposte approvate</h4> 
                {proposteApprovate.length>0 && <p>proposte approvate totali: {proposteApprovate.length}</p>}    
                {proposteApprovate.length==0 && <p>Non ci sono proposte approvate.</p> }
                {proposteApprovate.length>0 && proposteApprovate.map((proposta, index) => (
                    <Proposta
                        key={proposta.propostaID+"fase3-approvata"} /** key unica per il componente proposta **/
                        proposta={proposta}
                        indice={index}
                        utente={utente}
                        budgetSociale={budgetSociale}
                        mostraUsername={true}
                        mostraPreferenze={true}
                    />)
                )}
            </Col>

            <Col>
                {utente && proposteNonApprovate && <> <GapVerticale/> <h5>Proposte non approvate</h5></> }
                {utente && proposteNonApprovate && proposteNonApprovate.length==0 && <p>Non ci sono proposte non approvate.</p> }
                {utente && proposteNonApprovate && proposteNonApprovate.length>0 && proposteNonApprovate.map((proposta, index) => (
                    <Proposta
                        key={proposta.propostaID+"fase3-non-approvata"} /** key unica per il componente proposta **/
                        proposta={proposta}
                        indice={index}
                        utente={utente}
                        budgetSociale={budgetSociale}
                        mostraUsername={false}
                        mostraPreferenze={false}
                    />)
                )}
            </Col>

        </Row>
    </>);

}

function GapVerticale(){
    return (<><br/><br/><br/><br/><br/><br/><br/><br/></>);
}

function BottoneHome() {
    return (
        <Button mb={3} as={Link} to="/" variant="primary" className="text-white mb-2 me-4">Torna alla home</Button>
    );
}

export {TerzaFase};