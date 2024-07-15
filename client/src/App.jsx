import { useEffect, useState } from 'react'
import Row from "react-bootstrap/Row"
import Container from 'react-bootstrap/esm/Container'
import 'bootstrap/dist/css/bootstrap.min.css';
import MyHeader from './components/MyHeader'
import Errore from "./components/Errore"
import { Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom'
import { AccediForm, RegistratiForm } from './components/ComponentiAutenticazione.jsx'
import API from "./API.mjs";
import Alert from "react-bootstrap/Alert"
import Home from "./components/Home";
import {PrimaFase} from "./components/PrimaFase.jsx";
import {SecondaFase} from "./components/SecondaFase.jsx";
import {TerzaFase} from "./components/TerzaFase.jsx";
import CaricamentoSpinner from './components/CaricamentoSpinner.jsx';
import { Profilo } from './components/Profilo.jsx';

function App() {
    const [utente, setUtente] = useState(null);
    const [loggato, setLoggato] = useState(false);
    const [message, setMessage] = useState("");
    const [budgetSociale, setBudgetSociale] = useState(null);

    const accesso = async(credenziali) => {
        try {
            const utente = await API.logIn(credenziali);
            setUtente(utente);
            setLoggato(true);
            setMessage({msg: "Benvenuto, @"+utente.username+"!", type: "success"});
        }catch(err) {
            setMessage({msg: err, type: "danger"});
        }
    };

    const registrazione = async(credenziali) => {
        try {
            const utente = await API.signIn(credenziali);
            setMessage({msg: "Registrazione dell'utente '@"+utente.username+"' avvenuta correttamente.", type: "success"});
            return true;
        }
        catch(err) {
            setMessage({msg: err, type: "danger"});
            return false;
        }
    };

    const navigate = useNavigate();
    const uscita = async() => {
        try {
            await API.logOut();
            setUtente(null);
            setLoggato(false);
            setMessage({msg: "Disconnessione avvenuta correttamente.", type: "primary"});
            navigate("/");
        }
        catch(err) {
            return err;
        }
    };

    useEffect(() => {
        const controllaAutenticazione = async() => {
            try {
                const utente = await API.getUserInfo();
                setUtente(utente);
                setLoggato(true);
            }
            catch(err) {
                return err;
            }
        };
        controllaAutenticazione();
    }, []);

    useEffect(() => {
        const getBudgetSociale = async() => {
            try {
                const budget = await API.getBudgetSociale();
                setBudgetSociale(budget);
            }
            catch(err) {
                return err;
            }
        }
        getBudgetSociale();
    }, [utente, budgetSociale && budgetSociale.fase]);

    //essenziale per passare sempre la fase corrente ai componenti delle routes. serve per reindirizzare in caso di inserimento manuale di un url non corrispondente alla fase corrente
    if(!budgetSociale) 
        return (<CaricamentoSpinner elemento={"budget sociale"}/>);

    return(
        <Routes>
            <Route element={
                <>
                <MyHeader loggato={loggato} utente={utente} esci={uscita}></MyHeader>
                <Container fluid className="mt-3">
                    {message && <Row> {/* base per tutte le pagine: header ed eventuali messaggi */}
                        <Alert variant={message.type} onClose={() => setMessage('')} dismissible>{message.msg}</Alert>
                    </Row>}
                    <Outlet></Outlet> {/* contenuto renderizzato in base al path */}
                </Container>
                </>
                }>

                <Route path="/" element={ <Home utente={utente} budgetSociale={budgetSociale} setBudgetSociale={setBudgetSociale} setMessage={setMessage}/> }></Route>
                <Route path="/home" element={ <Home utente={utente} budgetSociale={budgetSociale} setBudgetSociale={setBudgetSociale} setMessage={setMessage}/> }></Route>
                <Route path="/fase1" element={ <PrimaFase utente={utente} budgetSociale={budgetSociale} setBudgetSociale={setBudgetSociale} setMessage={setMessage}/> }></Route>
                <Route path="/fase2" element={ <SecondaFase utente={utente} budgetSociale={budgetSociale} setBudgetSociale={setBudgetSociale} setMessage={setMessage} /> }></Route>
                <Route path="/fase3" element={ <TerzaFase utente={utente} budgetSociale={budgetSociale} setBudgetSociale={setBudgetSociale} setMessage={setMessage}/> }></Route>
                <Route path="/profilo" element={ <Profilo utente={utente} budgetSociale={budgetSociale} setMessage={setMessage}/>} ></Route>
                <Route path="/accedi" element={ !utente? <AccediForm accedi={accesso}/> : <Navigate to="/"/> }></Route>
                <Route path="/registrati" element={ !utente? <RegistratiForm registrati={registrazione}/> : <Navigate to="/"/> }></Route>
                <Route path="*" element={ <Errore/> }></Route>
            </Route>
        </Routes>
    );

}

export default App;
