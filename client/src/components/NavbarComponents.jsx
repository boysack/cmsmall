import { Form, Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';

import API from '../API';
import MessageContext from '../messageCtx';

import { LoginButton, LogoutButton } from './AuthComponents';

const Navigation = (props) => {
    const [title, setTitle] = useState("");
    const [editTitle, setEditTitle] = useState(false);

    const { handleErrors } = useContext(MessageContext);

    const loggedIn = props.loggedIn;
    const logout = props.logout;
    const user = props.user;

    useEffect(() => {
        const init = async () => {
            try {
                const title = await API.getTitle();
                //test context error
                //throw {errors: ["Cannot get site title"]}
                setTitle(title.title);
            } catch(err) {
                handleErrors(err);
            }
        }
        init();
    }, []);

    const showEditTitle = () => {
        setEditTitle(!editTitle);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.editTitle(title);
            const t = await API.getTitle();
            setTitle(t.title);
        } catch(err) {
            handleErrors(err);
            setTitle("");
        }
        setEditTitle(false);
    }

    return (
        <>
        <Navbar bg="dark" variant="dark" fixed="top">
            <i className=""/>
            {editTitle
            ?<Form onSubmit={handleSubmit}><Form.Control className="m-1" size="sm" type="text" value={title} onChange={(e) => setTitle(e.target.value)}/></Form>
            :<Link to="/"><Navbar.Brand><span className="navigation-text fs-4">{title}</span></Navbar.Brand></Link>}
            {/* button to visualize the edit of the title */}
            <Navbar.Collapse>
                <Nav className="me-auto">
                    {user && user.admin && <Nav.Link onClick={showEditTitle}>{editTitle?"cancel":"edit site title"}</Nav.Link>}
                    <Nav.Link as={Link} to="/front-office">front-office</Nav.Link>
                    {loggedIn?<Nav.Link as={Link} to="/back-office">back-office</Nav.Link>:false}
                </Nav>
                <Nav className="ms-auto">
                    <Navbar.Text className="mx-4 fs-4">
                        {user && user.name && `Welcome, ${user.name}`}
                    </Navbar.Text>
                    {loggedIn?<LogoutButton logout={logout}/>:<LoginButton/>}
                </Nav>
            </Navbar.Collapse>
        </Navbar>
        </>
    )
}

export { Navigation };