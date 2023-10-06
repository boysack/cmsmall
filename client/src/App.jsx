import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css'

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { useEffect, useState } from 'react';

import API from './API';
import MessageContext from './messageCtx';

import { LoginForm } from './components/AuthComponents';
import { Navigation } from './components/NavbarComponents';
import { FrontOffice, BackOffice, PageView } from './components/ViewComponents';
import { AddPage, EditPage } from './components/EditComponents';

const blockTypes = {
  "header": ["<h4>", "", "</h4>"],
  "paragraph": ["<p>", "", "</p>"],
  "image": ["<img src=", "", "></img>"]
}

function App() {
  /* User states */
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  /* Functional states */
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  /* Data states */
  // just smoother using two lists, nothing more
  const [pubPages, setPubPages] = useState([]);
  const [allPages, setAllPages] = useState([]);
  const [userList, setUserList] = useState([]);

  const handleErrors = (err) => {
    const maxErrors = 3;
    let msgs = [];
    if (err.errors) msgs = err.errors;
    else msgs = ["Unknown Error"];
    setMessages(currErrors => {
      const cp = [...currErrors];
      msgs.forEach((m) => {
        if(cp.length==maxErrors)
          cp.shift();
        cp.push(m);
      });
      return cp;
    });
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const user = await API.getUserInfo();
        if(user) {
          setUser(user);
          setLoggedIn(true);
          if(user.admin) {
            const userList = await API.getUsersList();
            setUserList(userList);
          }
        };
      } catch (err) {
        setUser(null);
        setLoggedIn(false); 
        setLoading(false);
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
      if(user.admin) {
        const userList = await API.getUsersList();
        setUserList(userList);
      }
    } catch (err) {
      // managed in AuthComponents
      throw err;
    }
  }

  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser(null);
    setAllPages([]);
    setUserList([]);
    setDirty(true);
  };

  return (
    <BrowserRouter>
      <MessageContext.Provider value={{ handleErrors }}>
      <Navigation loggedIn={loggedIn} logout={handleLogout} user={user}/>
      <Container fluid className='below-nav'>
        <Row className="justify-content-center">
          <Col>
            {messages.map((msg, i) => <Alert
              key={i}
              dismissible={i==0}
              show={messages.length!=0}
              onClose={() => {
                setMessages([]);
              }}
              variant="danger">
              {msg}
            </Alert>)}
          </Col>
        </Row>
        <Routes>
          <Route path="/" element={<Navigate replace to="/front-office"/>}/>
          <Route path="/front-office" element={
            <FrontOffice  pubPages={pubPages} setPubPages={setPubPages}
                          dirty={dirty} setDirty={setDirty}
          />}/>
          <Route path="/back-office" element={loggedIn
            ?<BackOffice  allPages={allPages} setAllPages={setAllPages}
                          dirty={dirty} setDirty={setDirty}
                          user={user}/>
            :<Navigate replace to="/"/>
          }/>
          <Route path="/pages/:pageId" element={
            <PageView user={user} dirty={dirty} setDirty={setDirty}/>
          }/>
          <Route path="/addPage" element={loggedIn
            ?<AddPage setDirty={setDirty} user={user} loading={loading} setLoading={setLoading}/>
            :<Navigate replace to="/"/>
          }/>
          <Route path="/editPage/:pageId" element={loggedIn
            ?<EditPage setDirty={setDirty} user={user} userList={userList} loading={loading} setLoading={setLoading}/>
            :<Navigate replace to="/"/>
          }/>
          <Route path="/login" element={<LoginForm login={handleLogin}/>}/>
          <Route path="*" element={<div className='below-nav'>URL INESISTENTE</div>}/>
        </Routes>
      </Container>
      </MessageContext.Provider>
    </BrowserRouter>
  )
}

export default App;
export { blockTypes };
