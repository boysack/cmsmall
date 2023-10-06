import { Row, Spinner } from "react-bootstrap";
import { Navigate, Outlet } from "react-router-dom";

const LoadingLayout = () => {
    return (
        <Row className="vh-100">
            <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true"/>
            <h1>Loading...</h1>
        </Row>
      )
}

// NON UTILIZZATO
const DefaultLayout = () => {
    return (
        <>
        <Navigate to="/front-office"/>
        <Outlet/>
        </>
    )
}

export { LoadingLayout, DefaultLayout };