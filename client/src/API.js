import dayjs from 'dayjs';

const SERVER_URL = 'http://localhost:3001/api/';

/**
 * A utility function for parsing the HTTP response.
 */
function getJson(httpResponsePromise) {
    return new Promise((resolve, reject) => {
        httpResponsePromise
            .then((response) => {
                if (response.ok) {
                response.json()
                    .then( json => resolve(json) )
                    .catch( err => reject({ errors: ["Cannot parse server response"] }))
                } else {
                response.json()
                    .then(obj => reject(obj))
                    .catch(err => reject({ errors: ["Cannot parse server response" ] }))
                }
            }).catch(err => 
                reject({ errors: ["Cannot communicate"] })
            )
    });
}
/**
 * Get the title of the site
 */
const getTitle = async () => {
    return getJson(
        fetch(SERVER_URL + "title", {credentials: "include"})
    ).then(json =>  json);
}

const editTitle = (title) => {
    return getJson(
        fetch(SERVER_URL + "title", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({title:title}),
        })
    )
}

/**
 * Get the list of the site given the filter (all|published)
 */
const getPages = async (filter) => {
    return getJson(
        filter?
            fetch(SERVER_URL + `pages?filter=${filter}`, {credentials: "include"}):
            fetch(SERVER_URL + "pages?filter=all", {credentials: "include"})
    ).then(json => json);
}

const getPage = async (id) => {
    return getJson(
        fetch(SERVER_URL + `pages/${id}`, {credentials: "include"})
    ).then(json => json);
}

const addPage = async (page, blocks) => {
    return getJson(
        fetch(SERVER_URL + "pages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({page: page, blocks: blocks}),
        })
    )
}

const editPage = async (page, blocks, userId) => {
    return getJson(
        fetch(SERVER_URL + `pages/${page.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({page: page, blocks: blocks, userId: userId})
        })
    )
}

const deletePage = async (pageId) => {
    return getJson(
        fetch(SERVER_URL + `pages/${pageId}`, {
            method: "DELETE",
            credentials: "include",
        })
    )
}

const logIn = async (credentials) => {
    return getJson(
        fetch(SERVER_URL + "sessions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(credentials),
        })
    )
}

const logOut = async () => {
    return getJson(
        fetch(SERVER_URL + "sessions/current", {
            method: "DELETE",
            credentials: "include",
        })
    )
}

const getUserInfo = async () => {
    return getJson(
        fetch(SERVER_URL + "sessions/current", {credentials: "include"})
    )
}

const getUsersList = async () => {
    return getJson(
        fetch(SERVER_URL + "users", {credentials: "include"})
    )
}

const API =  { getTitle, editTitle, getPages, getPage, addPage, editPage, deletePage, logIn, logOut, getUserInfo, getUsersList };
export default API;