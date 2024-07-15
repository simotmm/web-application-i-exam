import {Button, Spinner, Row, Col} from "react-bootstrap"

export default function CaricamentoSpinner(props){
    return (
        <Row>
            <Col></Col>
            <Col className="d-flex justify-content-center align-items-center">
                <Button className='btn btn-outline-dark'  disabled>
                <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                />
                Caricamento {props.elemento} in corso...
                </Button>
            </Col>
        <Col></Col>
      </Row>
    );
}