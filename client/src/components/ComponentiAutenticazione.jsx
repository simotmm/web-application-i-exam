/* NEW */
import { useState } from 'react';
import { Form, Button, Row, Col, Card, FloatingLabel} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';


function AccediForm(props){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async(event) => {
        event.preventDefault();
        const credenziali = {username, password};
        try{
            await props.accedi(credenziali);
        }
        catch(err){
            return err;
        }
    };

    return (
        <Row >
            <Col></Col>
            <Col md={3} >
                <Card className='text-center-align'>
                    <Card.Body>
                        <Card.Title>Accedi</Card.Title>
                        <Form onSubmit={handleSubmit}>
                            <FloatingLabel controlId="username" label="username" className="mb-3">
                                <Form.Control 
                                    type="username" 
                                    placeholder="username" 
                                    value={username} 
                                    onChange={ev => setUsername(ev.target.value)} 
                                    required={true} 
                                    pattern="^\S*$"
                                    title="L'username non deve contenere spazi"
                                />
                            </FloatingLabel>
                            <FloatingLabel controlId="password" label="Password">
                                <Form.Control 
                                    type="password" 
                                    placeholder="password" 
                                    value={password} 
                                    onChange={ev => setPassword(ev.target.value)} 
                                    required={true} 
                                    pattern="^\S*$"
                                    title="La password non deve contenere spazi"
                                />
                            </FloatingLabel>
                            <Button variant="primary" type="submit">Accedi</Button>
                            <Link className='btn btn-danger mx-2 my-2' to={'/'}>Indietro</Link>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
            <Col></Col>
        </Row>
    );
    
}

function LogoutButton(props) {
    return(
      <Button className='btn btn-outline-light' variant='outline-light' onClick={props.esci}>Esci</Button>
    )
}

function RegistratiForm(props){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async(event) => {
        event.preventDefault();
        const utente = {username, password};
        try{
            let ok = await props.registrati(utente);
            if(ok)
                navigate("/");
        }
        catch(err){
            return err;
        }
    }

    return (
        <Row >
            <Col></Col>
            <Col md={3} >
                <Card className='text-center-align'>
                    <Card.Body>
                        <Card.Title>Registrati</Card.Title>
                        <Form onSubmit={handleSubmit}>
                            <FloatingLabel controlId="username" label="username" className="mb-3">
                                <Form.Control
                                    type="username" 
                                    placeholder="username" 
                                    value={username} 
                                    onChange={ev => setUsername(ev.target.value)} 
                                    required={true} 
                                    pattern="^\S*$"
                                    title="L'username non deve contenere spazi"
                                />
                            </FloatingLabel>
                            <FloatingLabel controlId="password" label="Password">
                                <Form.Control 
                                    type="password" 
                                    placeholder="password"
                                    value={password} 
                                    onChange={ev => setPassword(ev.target.value)} 
                                    required={true} 
                                    pattern="^\S*$"
                                    title="La password non deve contenere spazi"
                                />
                            </FloatingLabel>
                            <Button variant="primary" type="submit">Registrati</Button>
                            <Link className='btn btn-danger mx-2 my-2' to={'/'}>Indietro</Link>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
            <Col></Col>
        </Row>
    );
}

export { AccediForm, RegistratiForm, LogoutButton};