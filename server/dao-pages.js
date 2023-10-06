'use strict';

/** Data Access Object (DAO) module for accessing pages data **/

const db = require('./db');

/**
 * Filtrare per front-office e back office? => ottimizzare ritornando solo pagine pubblicate?
 */
exports.listPages = () => {
    return new Promise((resolve, reject) => {
        const sql = "select id, userid as userId, title, author, creationdate as creationDate, publicationdate as publicationDate from pages";
        db.dbAllAsync(sql).then(pages => resolve(
            pages.map(page => {
                return {
                    id: page.id,
                    userId: page.userId,
                    title: page.title,
                    author: page.author,
                    creationDate: page.creationDate,
                    publicationDate: page.publicationDate?page.publicationDate:""
                }
            })
        )).catch(err => reject(err));
    })
};

/**
 * Get page given pageId
 */
exports.getPageByPageId = (pageId) => {
    const sql = "select id, userid as userId, title, author, creationdate as creationDate, publicationdate as publicationDate from pages where id = ?";
    return db.dbGetAsync(sql, [pageId]);
}

/**
 * Add a page to the list
 */
exports.addPage = (page) => {
    const intsertPage = "insert into pages (userid, title, author, creationdate, publicationdate) values (?, ?, ?, ?, ?)";
    return db.dbRunAsync(intsertPage, [
        page.userId,
        page.title,
        page.author,
        page.creationDate,
        page.publicationDate?page.publicationDate:null
    ]);/* .then((pageId) => {
        const getNewPage = "select id, userid as userId, title, author, publicationdate as publicationDate from pages where id = ?";
        db.dbGetAsync(getNewPage, pageId);
    }); */
}

/**
 * Update page
 */
exports.updatePageById = (pageId, page) => {
    const updatePage = "update pages set userid=?, title=?, author=?, publicationdate=? where id=?";
    return db.dbRunAsync(updatePage, [
        page.userId,
        page.title,
        page.author,
        page.publicationDate?page.publicationDate:null,
        pageId
    ]);
}

/**
 * Delete page
 */
exports.deletePageById = (pageId) => {
    const deletePage = "delete from pages where id = ?";
    return db.dbRunAsync(deletePage, [pageId]);
}