import { useState } from "react";
import { Button, Row, Col, Form, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const LoginButton = () => {
    return(
        <Link to="/login"><Button>Login</Button></Link>
    )
}

const LogoutButton = (props) => {
    const logout = props.logout;
    
    return(
        <Button onClick={logout}>Logout</Button>
    )
}

const LoginForm = (props) => {
    const login = props.login;

    const [username, setUsername] = useState("testadmin0@polito.it");
    const [password, setPassword] = useState("password");

    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState([]);

    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        const credentials = { username, password };
        
        login(credentials)
            .then(() => navigate("/"))
            .catch((err) => {
                setErrorMessage(err.errors); 
                setShow(true); 
            });
    };

    return(
    <Row className="vh-100 justify-content-center">
    <Col md={4}>
    <h1 className="pb-3">Login</h1>
        <Form  onSubmit={handleSubmit}>
            <Alert
              dismissible
              show={show}
              onClose={() => setShow(false)}
              variant="danger">
              {errorMessage}
            </Alert>
            <Form.Group className="mb-3" controlId="username">
                <Form.Label>email</Form.Label>
                <Form.Control
                  type="email"
                  value={username} placeholder="email"
                  onChange={(ev) => setUsername(ev.target.value)}
                  required={true}
                />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password} placeholder="password"
                  onChange={(ev) => setPassword(ev.target.value)}
                  required={true} minLength={6}
                />
            </Form.Group>
            <Button className type="submit">Login</Button>
            <Button as={Link} to={"/"} variant="danger">Cancel</Button>
        </Form>
    </Col>
    </Row>
    )
}

export {LoginButton, LogoutButton, LoginForm};