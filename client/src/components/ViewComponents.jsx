import { Button, ListGroup } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";

import API from "../API";
import { blockTypes } from "../App";
import MessageContext from "../messageCtx";

import dayjs from "dayjs";

const FrontOffice = (props) => {
    const pubPages = props.pubPages;
    const setPubPages = props.setPubPages;
    const filter = "published";

    const dirty = props.dirty;
    const setDirty = props.setDirty;
    
    return (
        <>
        <h1 className="pb-3">Pagine pubblicate</h1>
        <Office pages={pubPages} setPages={setPubPages}
                filter={filter}
                dirty={dirty} setDirty={setDirty}
        />
        </>
    )
}

const BackOffice = (props) => {
    const allPages = props.allPages;
    const setAllPages = props.setAllPages;
    const filter = "all";
    const user = props.user;

    const dirty = props.dirty;
    const setDirty = props.setDirty;
    
    return (
        <>
        <h1 className="pb-3">Tutte le pagine</h1>
        <Link to="/addPage" id="addButton" className="me-auto"><Button><i className="bi bi-plus"/>  ADD A NEW PAGE</Button></Link>
        <Office pages={allPages} setPages={setAllPages}
                filter={filter} user={user}
                dirty={dirty} setDirty={setDirty}
        />
        </>
    )
}

const Office = (props) => {
    const pages = props.pages;
    const setPages = props.setPages;
    const filter = props.filter;
    const user = props.user;

    const dirty = props.dirty;
    const setDirty = props.setDirty;

    const { handleErrors } = useContext(MessageContext);

    useEffect(() => {
        setDirty(true);
    }, [filter]);

    useEffect(() => {
        const update = async () => {
            if(dirty) {
                try {
                    const fetchedPages = await API.getPages(filter);
                    const sortedPages = fetchedPages.sort((a,b) => {
                        if(dayjs(a.publicationDate).isValid() && dayjs(b.publicationDate).isValid())
                            return dayjs(b.publicationDate).diff(dayjs(a.publicationDate), 'day')
                        else if(dayjs(b.publicationDate).isValid())
                            return -1;
                        else
                            return 1;
                    });
                    setPages(sortedPages);
                    setDirty(false);
                } catch(err) {
                    handleErrors(err);
                }
            }
        }
        update();
    }, [filter, dirty]);

    return (
        <>
        {pages.map((page) => <PageRow key={page.id} page={page} user={user?user:false} setDirty={setDirty}/>)}
        </>
    )
}

const PageRow = (props) => {
    const page = props.page;
    const pageId = props.page.id;
    const user = props.user;
    const setDirty = props.setDirty;

    const { handleErrors } = useContext(MessageContext);

    const handleDelete = async () => {
        try {
            await API.deletePage(pageId);
            setDirty(true);
        } catch (err) {
            handleErrors(err);
        }
    }

    return(
        <ListGroup horizontal={"md"} className="m-1">
            <ListGroup.Item as={Link} to={`/pages/${pageId}`} className="page-list-item page-list-item-clickable">
                   <h5>{page.title}</h5>
                   <small>click to open</small>
            </ListGroup.Item>
            <ListGroup.Item className="page-list-item">
                    Autore:  {page.author}<br/>
                    {dayjs().diff(dayjs(page.publicationDate))>=0 && `Pubblicato il: ${page.publicationDate}`}
                    {dayjs().diff(dayjs(page.publicationDate))<0 && `Da pubblicare il: ${page.publicationDate}`}
                    {!page.publicationDate && `Bozza`}
            </ListGroup.Item>
            <ListGroup.Item className="page-list-item">
                {user && ((user.id===page.userId)||user.admin) &&
                    <><Link to={`/editPage/${pageId}`}><Button><i className="bi bi-pencil-square"/>  EDIT</Button></Link>
                    <Button variant="danger" onClick={() => handleDelete()}><i className="bi bi-trash"/>  DELETE</Button></>
                }
            </ListGroup.Item>
        </ListGroup>
    )
}

const PageView = (props) => {
    const { pageId } = useParams();

    const [page, setPage] = useState({});
    const [blocks, setBlocks] = useState([]);
    
    const user = props.user;
    const dirty = props.dirty;
    const setDirty = props.setDirty;

    const { handleErrors } = useContext(MessageContext);
    const navigate = useNavigate();

    useEffect(() => {
        setDirty(true);
    }, [pageId])

    useEffect(() => {
        if(dirty) {   
            const update = async () => {
                try {
                    const response = await API.getPage(pageId);
                    const sortedBlocks = response.pageBlocks.sort((a,b) => a.index-b.index).map(block => {
                        // remove index property 
                        return {
                            id: block.id,
                            pageId: block.pageId,
                            type: block.type,
                            content: block.content
                        }
                    });
                    setBlocks(sortedBlocks);
                    setPage(response.page);
                    setDirty(false);
                } catch(err) {
                    handleErrors(err);
                }
            }
            update();
        }
    }, [pageId, dirty]);

    const handleDelete = async () => {
        try {
            await API.deletePage(pageId);
            navigate("/back-office");
            setDirty(true);
        } catch (err) {
            handleErrors(err);
        }
    }

    return (
        <div className="text-center">
            <h1>{page.title}</h1>
            {user && ( user.id===page.userId || user.admin ) &&
                <><Link to={`/editPage/${pageId}`}><Button><i className="bi bi-pencil-square"/>  EDIT</Button></Link>
                <Button variant="danger" onClick={() => handleDelete()}><i className="bi bi-trash"/>  DELETE</Button></>
            }
            <hr
                className="title-divider"
            />
            {blocks.map((block) => <BlockView key={block.id} block={block}/>)}
        </div>
    );
}

const BlockView = (props) => {
    const block = props.block;
    const blockComponent = blockTypes[block.type].map((e, i) => {
        if(i===1) return block.content;
        else return e;
    });
    return(
        <>
            <div className="page-content" dangerouslySetInnerHTML={{__html: blockComponent.join("")}} />
            <hr
                className="block-divider"
            />
        </>
    );
}

export { FrontOffice, BackOffice, PageView };