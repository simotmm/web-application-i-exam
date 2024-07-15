import {Row, Col, Button} from "react-bootstrap";
import {Link} from "react-router-dom";

export default function PaginaNonTrovata() {
    return(
        <Row>
            <Col></Col>
            <Col md={4}>
                <h3>Errore</h3>
                <h5>Operazione non consentita o pagina inesistente</h5>
                <br/> <br/>
                <div className="text-center">
                    <Button mb={3} as={Link} to="/" variant="primary" className="text-white mb-2 me-4">Torna alla home</Button>
                </div>
            </Col>
            <Col></Col>
        </Row>
    );
}