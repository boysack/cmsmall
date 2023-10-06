import { useContext, useEffect, useState } from "react";
import { Row, Col, Button, Form } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";

import API from "../API";
import MessageContext from "../messageCtx";

const AddPage = (props) => {
    const setDirty = props.setDirty;
    const user = props.user;
    const loading = props.loading;
    const setLoading = props.setLoading;

    const [page, setPage] = useState({});
    const [blocks, setBlocks] = useState([]);

    const { handleErrors } = useContext(MessageContext);

    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        setPage({
            title: "",
            publicationDate: ""
        });
        setBlocks([
            {
                type: "header",
                content: ""
            },
            {
                type: "paragraph",
                content: ""
            }
        ]);
        setLoading(false);
    }, []);

    const handleAdd = async (event) => {
        event.preventDefault();
        let h = 0; let p = 0; let i = 0;
        blocks.forEach((b) => {
            b.type==="header" && h++ ||
            b.type==="paragraph" && p++ ||
            b.type==="image" && i++ ;
        });

        if((h>0&&p>0) || (h>0&&i>0)) {
            try {
                const pageId = await API.addPage(page, blocks);
                setDirty(true);
                navigate(`/pages/${pageId}`);
            } catch(err) {
                handleErrors(err);
            }
        } else {
            handleErrors({ errors: ["La pagina deve avere almeno un blocco \"header\" e almeno un blocco \"paragraph\""]})
        }
    }
    return(
        <>{!loading && <PageForm page={page} setPage={setPage} 
                                blocks={blocks} setBlocks={setBlocks} 
                                handleSubmit={handleAdd} user={user}/>}</>
    )
}

const EditPage = (props) => {
    const setDirty = props.setDirty;
    const user = props.user;
    const userList = props.userList;
    const loading = props.loading;
    const setLoading = props.setLoading;

    const [page, setPage] = useState({});
    const [blocks, setBlocks] = useState([]);

    const navigate = useNavigate();
    const { handleErrors } = useContext(MessageContext);
    const { pageId } = useParams();

    useEffect(() => {
        const loadPage = async () => {
            setLoading(true);
            try {
                const result = await API.getPage(pageId);
                const page = {...result.page}
                const sortedBlocks = result.pageBlocks.sort((a,b) => a.index-b.index).map(block => {
                    return(
                        // remove index property, id, pageId property
                        {
                            type: block.type,
                            content: block.content
                        }
                    )
                });
                setPage(result.page);
                setBlocks(sortedBlocks);
            } catch(err) {
                handleErrors(err);
            }
            setLoading(false);
        };
        loadPage();
    }, [pageId]);

    const handleEdit = async (event) => {
        event.preventDefault();
        let h = 0; let p = 0; let i = 0;
        blocks.forEach((b) => {
            b.type==="header" && h++ ||
            b.type==="paragraph" && p++ ||
            b.type==="image" && i++ ;
        });
        if((h>0&&p>0)||(h>0&&i>0)) {
            try {
                const userId = page.userId;
                const p = {id: page.id, title: page.title, publicationDate: page.publicationDate};
                const pageId = await API.editPage(p, blocks, userId);
                setDirty(true);
                navigate(`/pages/${pageId}`);
            } catch(err) {
                handleErrors(err);
            }
        } else {
            handleErrors({ errors: ["La pagina deve avere almeno un blocco \"header\" e almeno un blocco \"paragraph\""]});
        }
    }

    return (
        <>{!loading && <PageForm page={page} setPage={setPage}
                                blocks={blocks} setBlocks={setBlocks} 
                                handleSubmit={handleEdit} user={user} userList={userList}/>}</>
    )
}

const PageForm = (props) => {
    const page = props.page;
    const setPage = props.setPage;

    const blocks = props.blocks;
    const setBlocks = props.setBlocks;

    const user = props.user;
    const userList = props.userList;

    const handleSubmit = props.handleSubmit;

    const handleTitleChange = (e) => {
        setPage((page) => {
            return {
                ...page,
                title: e.target.value
            }
        })
    }

    const handlePDateChange = (e) => {
        setPage((page) => {
            return {
                ...page,
                publicationDate: e.target.value
            }
        })
    }

    const handleAuthorChange = (e) => {
        setPage((page) => {
            return {
                ...page,
                userId: e.target.value
            }
        })
    }

    const handleAddBlock = () => {
        setBlocks([...blocks, {type: "header", content: ""}]);
    }

    return (
        <>
        <Form className="full-width" onSubmit={handleSubmit}>
            <Form.Group className="full-width">
            <Row>
                <Col>
                    <Button type="submit">CONFIRM</Button>
                    <Link to="/back-office"><Button variant="danger">CANCEL</Button></Link>
                </Col>
                <Col xs={5}>
                    <Form.Control style={{fontSize: "40px", fontWeight: "bold"}} type="text" placeholder="title" required={true} value={page.title} onChange={(e) => handleTitleChange(e)}/>
                </Col>
                <Col>
                    <Form.Label style={{fontSize: "15px", fontWeight: "bold"}}>Publication date</Form.Label>
                    <Form.Control style={{fontSize: "15px"}} type="date" value={page.publicationDate} onChange={(e) => handlePDateChange(e)}></Form.Control> 
                </Col>
                <Col>
                {user.admin && userList && userList.length!==0 && 
                <>
                    <Form.Label style={{fontSize: "15px", fontWeight: "bold"}}>Author</Form.Label>
                    <Form.Select style={{fontSize: "15px"}} className="mt-1 w-auto" required={true} value={page.userId} onChange={(e) => handleAuthorChange(e)}>
                        {userList.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
                    </Form.Select>
                </>}
                </Col>
            </Row>
            </Form.Group>
            &nbsp;
            {
                blocks.map((b, i) => <BlockFrom key={i} index={i} blocks={blocks} setBlocks={setBlocks}/>)
            }
        <Button onClick={handleAddBlock}><i className="bi bi-plus"/>  ADD A BLOCK</Button>
        </Form>
        </>
    )
}

const BlockFrom = (props) => {
    const index = props.index;

    const blocks = props.blocks;
    const setBlocks = props.setBlocks;

    const [type, setType] = useState(blocks[index].type);
    const [content, setContent] = useState(blocks[index].content);
    
    useEffect(() => {
        setType(blocks[index].type);
        setContent(blocks[index].content);
    }, [blocks]);

    const handleTypeChange = (e) => {
        const newBlocks = blocks.map((b, i) => {
            if(i===index)
                return {type: e.target.value, content: b.content}
            return b;
        });
        setBlocks(newBlocks);
        setType(e.target.value);
    }

    const handleContentChange = (e) => {
        const newBlocks = blocks.map((b, i) => {
            if(i===index)
                return {type: b.type, content: e.target.value}
            return b;
        });
        setBlocks(newBlocks);
        setContent(e.target.value);
    }

    const swapBlocks = (blocks, i1, i2) => {
        const t = blocks[i1];
        blocks[i1] = blocks[i2];
        blocks[i2] = t;
    }

    const moveBlockUp = () => {
        if(index>0) {
            setBlocks((blocks) => {
                const newBlocks = [...blocks];
                swapBlocks(newBlocks, index, index-1);
                return newBlocks;
            });
        }
    }

    const moveBlockDown = () => {
        if(index<(blocks.length-1)) {
            const newBlocks = [...blocks];
            swapBlocks(newBlocks, index, index+1);
            setBlocks(newBlocks);
        }
    }

    const handleDelete = () => {
        const cleanedBlocks = blocks.filter((b, i) => i!==index);
        setBlocks(cleanedBlocks);
    }

    return (
        <>
        {index!==0 && <Button variant="dark" className="arrow-button" onClick={() => {moveBlockUp(index)}}><i className="bi bi-chevron-up"/></Button>}
        <Row>
        <Col xs={11}>
        <Form.Group>
            <Form.Control as="textarea" rows="5" placeholder="content" required={true} value={content} onChange={(e) => handleContentChange(e)}/>
        </Form.Group>
        </Col>
        <Col>
            <Button variant="danger" className="m-0" onClick={() => handleDelete()}><i className="bi bi-trash"/></Button>
        </Col>
        </Row>
        <Form.Select className="mt-1 w-auto" required={true} value={type} onChange={(e) => handleTypeChange(e)}>
          <option value="header">header</option>
          <option value="paragraph">paragraph</option>
          <option value="image">image</option>
        </Form.Select>
        {index!==(blocks.length-1) && <Button variant="dark" className="arrow-button" onClick={() => {moveBlockDown(index)}}><i className="bi bi-chevron-down"/></Button>}
        </>
    )
}

export { AddPage, EditPage };