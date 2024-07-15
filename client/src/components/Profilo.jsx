import { useEffect, useState } from "react";
import API from "../API.mjs";
import CaricamentoSpinner from "./CaricamentoSpinner";
import { Row, Col, Button} from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import Proposta from "./Proposta";

function Profilo(props){
    const utente = props.utente;
    const budgetSociale = props.budgetSociale;
    const fase = budgetSociale.fase;
    const setMessage = props.setMessage;
    const [proposteApprovate, setProposteApprovate] = useState(null);
    const [proposteNonApprovate, setProposteNonApprovate] = useState(null);
    const [proposteVotate, setProposteVotate] = useState(null);
    const navigate = useNavigate();
    
    useEffect(() => {

        let ok=true;
        if(!utente){
            ok=false;
            setMessage({msg: "Accesso non autorizzato. Autenticarsi per accedere alla pagina del profilo.", type: "danger"});
            navigate("/");
        }

        const getProposte = async() => {
            try{
                let proposte = [];
                let approvate = [];
                let nonApprovate = [];
                let votate = [];

                if(fase==0 || fase==1){
                    nonApprovate = await API.getProposteByUtenteID(utente && utente.utenteID)
                }
                else{
                    proposte = await API.getProposte();
                    approvate = proposte.filter(p => p.utenteID==utente.utenteID && p.approvata);
                    nonApprovate = proposte.filter(p => p.utenteID==utente.utenteID && !p.approvata);
                    votate = proposte.filter(p => p.preferenze.some(pr => pr.utenteID==utente.utenteID));
                }

                setProposteApprovate(approvate);
                setProposteNonApprovate(nonApprovate);
                setProposteVotate(votate);
            }
            catch(err){
                return err;
            }
        }
        if(ok)
            getProposte();
    }, [budgetSociale && budgetSociale.fase]);

    if (!budgetSociale || !proposteApprovate || !proposteNonApprovate || !proposteVotate) 
        return (<CaricamentoSpinner elemento={"pagina del profilo"} />);

    return (<>
        <Row>
            <Col className="text-end">
                <br/><br/><br/>
                <BottoneHome/>
            </Col>

            <Col md={6}>
                <h2 className="text-center">Budget Sociale</h2>
                <h3>Il mio profilo</h3>
                <p>
                    utente: @{utente && utente.username} <br/>
                    (budget totale: {fase==0? "in fase di definizione" : "€"+ parseFloat(budgetSociale.budget).toFixed(2) })
                </p> 
            </Col>

            <Col>
            </Col>
        </Row>

        <Row>
            <Col>
                {fase==3 && proposteNonApprovate && <>
                    <strong>Le mie proposte non approvate</strong>
                    {proposteNonApprovate.length>0 && <p>proposte approvate totali: {proposteNonApprovate.length}</p>} 
                    {proposteNonApprovate.length==0 && <p>Non hai proposte non approvate.</p> }
                    {proposteNonApprovate.length>0 && proposteNonApprovate.map((proposta, index) => (
                        <Proposta
                            key={proposta.propostaID+"-profilo-non-approvata"} /** key unica per il componente proposta **/
                            proposta={proposta}
                            indice={index}
                            utente={utente}
                            budgetSociale={budgetSociale}
                            paginaDelProfilo={true}
                            statoProposta={"non approvata"}
                        />)
                    )}
                </>}
            </Col>

            <Col md={6}>
                {fase==3 && proposteApprovate && <>
                    <strong>Le mie proposte approvate</strong>
                    {proposteApprovate.length>0 && <p>proposte approvate totali: {proposteNonApprovate.length}</p>} 
                    {proposteApprovate.length==0 && <p>Non hai proposte approvate.</p> }
                    {proposteApprovate.length>0 && proposteApprovate.map((proposta, index) => (
                        <Proposta
                            key={proposta.propostaID+"-profilo-approvata"} /** key unica per il componente proposta **/
                            proposta={proposta}
                            indice={index}
                            utente={utente}
                            budgetSociale={budgetSociale}
                            paginaDelProfilo={true}
                            statoProposta={"approvata"}
                            mostraPreferenze={true}
                        />)
                    )}
                </>}

                {fase!=3 && proposteNonApprovate && <>
                    <strong>Le mie proposte</strong>
                    {proposteNonApprovate.length>0 && <p>proposte totali: {proposteNonApprovate.length}</p>} 
                    {proposteNonApprovate.length==0 && <p>Non ci sono proposte da mostrare.</p> }
                    {proposteNonApprovate.length>0 && proposteNonApprovate.map((proposta, index) => (
                        <Proposta
                            key={proposta.propostaID+"-profilo-pre-approvazione"} /** key unica per il componente proposta **/
                            proposta={proposta}
                            indice={index}
                            utente={utente}
                            budgetSociale={budgetSociale}
                            paginaDelProfilo={true}
                            statoProposta={fase==1? "definita" : "definita, fase di votazione in corso"}
                        />)
                    )}
                </>}
            </Col>

            <Col>
                {(fase==2 || fase==3) && <>
                    <strong>I miei voti</strong>
                    {proposteVotate.length>0 && <p>proposte votate totali: {proposteVotate.length}</p>}   
                    {proposteVotate.length==0 && <p>Non hai votato nessuna proposta.</p> }
                    {proposteVotate.length>0 && proposteVotate.map((proposta, index) => (
                        <Proposta
                            key={proposta.propostaID+"-votata-da-utente"+utente.utenteID} /** key unica per il componente proposta **/
                            proposta={proposta}
                            indice={index}
                            utente={utente}
                            budgetSociale={budgetSociale}
                            mostraUsername={(proposta.approvata && fase==3)? true : false}
                            mostraPreferenze={(proposta.approvata && fase==3)? true : false}
                            statoProposta={ fase==2? "definita, fase di votazione in corso" : (proposta.approvata? "approvata" : "non approvata") }
                            paginaDelProfilo={true}
                        />)
                    )}  
                </>}
            </Col>
        </Row>
    </>);

}

function BottoneHome() {
    return (
        <Button mb={3} as={Link} to="/" variant="primary" className="text-white mb-2 me-4">Torna alla home</Button>
    );
}

export {Profilo};