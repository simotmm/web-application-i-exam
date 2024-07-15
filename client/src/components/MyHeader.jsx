import { Link } from 'react-router-dom';
import Navbar from "react-bootstrap/Navbar";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';
import { LogoutButton } from './ComponentiAutenticazione';

function MyHeader(props) {
    return (
        <Navbar bg='primary' variant='dark'>
            <Container fluid>
                <Row className="w-100 align-items-center">
                    <Col xs={6}>
                        <Link to='/' className='navbar-brand'>Budget Sociale</Link>
                    </Col>
                    <Col xs={6} className="text-end">
                        {props.loggato ? (
                            <div className="text-light">
                                Benvenuto, @{props.utente.username}! {" "}
                                <Link to='/profilo' className='btn btn-outline-light me-2'>Il mio profilo</Link>
                                <LogoutButton esci={props.esci}></LogoutButton>
                            </div>
                        ) : (<div>
                                <Link to='/accedi' className='btn btn-outline-light me-2'>Accedi</Link>
                                <Link to="/registrati" className='btn btn-outline-light'>Registrati</Link>
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>
        </Navbar>
    );
}

export default MyHeader;