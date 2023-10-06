'use strict';

/** Data Access Object (DAO) module for accessing blocks data **/

const db = require('./db');

/**
 * Retrieve blocks of a page by pageId
 * NOTE: index name in sqlite column lead to unpredictable behaviors
 */
exports.listPageBlocks = (pageId) => {
    const sql = "select id, pageid as pageId, \"index\", type, content from blocks where pageid = ?";
    return db.dbAllAsync(sql, [pageId]);
    // Potrebbe aver senso non ordinarlo in server ma nel client (distribuisco l'ordinamento)    
    /* .then((rows) => rows.sort((a, b) => a.index>b.index?1:-1));
    return blocks; */
};

/**
 * Add blocks to a newly created page
 */
exports.addPageBlocks = (pageId, newBlocks) => {
    const sql = "insert into blocks (pageId, \"index\", type, content) values " + newBlocks
        .map((b, i, a) => "(?, ?, ?, ?)" + ((i<a.length-1)?",":""))
        .reduce((prev, cur) => prev + cur);
    const values = newBlocks.flatMap((b) => [pageId, b.index, b.type, b.content]);
    return db.dbRunAsync(sql, values);
};

/* exports.updatePageBlocks = (pageId, newBlocks) => {
    // begin with:
    //  newBlocks => toInsert
    //  blocks => toDelete
    const toDelete = [];
    const toInsert = [];
    const toUpdate = [];

    this.listPageBlocks(pageId)
    .then((blocks) => {
        blocks.map((block) => {
            //if exists a new block with same id
            //  toUpdate.push(newBlock)
            //  newBlocks.purge(newBlock)
            //else
            //  toDelete = block
            const i = newBlocks.findIndex((newBlock) => block.id === newBlock.id)
            if(i!=-1){
                toUpdate.push(newBlocks[i]);
                newBlocks.splice(i, 1);
            } else {
                toDelete.push(block);
            }
        });
        toInsert.push(...newBlocks);

        const insertSql = "insert into blocks (pageId, \"index\", type, content) values " + toInsert
            .map((b, i, a) => "(?,?,?,?)" + ((i<a.length-1)?",":""))
            .reduce((prev, cur) => prev + cur);
        const toInsertFlat = toInsert.flatMap((b) => [pageId, b.index, b.type, b.content]);

        const deleteSql = "delete from blocks where id in (" + toDelete
            .map((b, i, a) => "?" + (((i<a.length-1)?",":")")))
            .reduce((prev, cur) => prev + cur);
        const toDeleteFlat = toDelete.flatMap((b) => [b.id])

        const updateSql = "update blocks set (pageId, \"index\", type, content) = case id " + toUpdate
            .map((b, i, a) => "when ? then (?,?,?,?) " + ((i<a.length-1)?"":"else (pageId, \"index\", type, content)"))
            .reduce((prev, cur) => prev + cur) + " end where id in (" + toUpdate
            .map((b, i, a) => "?" + ((i<a.length-1)?",":")"))
            .reduce((prev, cur) => prev + cur);
        const toUpdateFlat = toUpdate.flatMap((b) => [b.id, b.pageId, b.index, b.type, b.content]);

        return new Promise.all([
            db.dbRunAsync(insertSql, toInsertFlat),
            db.dbRunAsync(deleteSql, toDeleteFlat),
            db.dbRunAsync(updateSql, toUpdateFlat)
        ])
    }).catch((err) => Promise.reject(err));
}; */

exports.updatePageBlocksTest = async (pageId, newBlocks, oldBlocks) => {
    // begin with:
    //  newBlocks => toInsert
    //  oldBlocks => toDelete
    const toDelete = [];
    const toInsert = [];
    const toUpdate = [];

    oldBlocks.map((block) => {
        //if exists a new block with same id
        //  toUpdate.push(newBlock)
        //  newBlocks.purge(newBlock)
        //else
        //  toDelete = block
        const i = newBlocks.findIndex((newBlock) => block.id === newBlock.id)
        if(i!=-1){
            toUpdate.push(newBlocks[i]);
            newBlocks.splice(i, 1);
        } else {
            toDelete.push(block);
        }
    });
    toInsert.push(...newBlocks);

    const insertSql = "insert into blocks (pageId, \"index\", type, content) values " + toInsert
        .map((b, i, a) => "(?,?,?,?)" + ((i<a.length-1)?",":""))
        .reduce((prev, cur) => prev + cur);
    const toInsertFlat = toInsert.flatMap((b) => [pageId, b.index, b.type, b.content]);
    console.log(insertSql);
    console.log(toInsertFlat);

    const deleteSql = "delete from blocks where id in (" + toDelete
        .map((b, i, a) => "?" + (((i<a.length-1)?",":")")))
        .reduce((prev, cur) => prev + cur);
    const toDeleteFlat = toDelete.flatMap((b) => [b.id])
    console.log(deleteSql);
    console.log(toDeleteFlat);

    const updateSql = "update blocks set (pageId, \"index\", type, content) = case id " + toUpdate
        .map((b, i, a) => "when ? then (?,?,?,?) " + ((i<a.length-1)?"":"else (pageId, \"index\", type, content)"))
        .reduce((prev, cur) => prev + cur) + " end where id in (" + toUpdate
        .map((b, i, a) => "?" + ((i<a.length-1)?",":")"))
        .reduce((prev, cur) => prev + cur);
    const toUpdateFlat = toUpdate.flatMap((b) => [b.id, b.pageId, b.index, b.type, b.content]);
    console.log(updateSql);
    console.log(toUpdateFlat);

    return new Promise.all([
        db.dbRunAsync(insertSql, toInsertFlat),
        db.dbRunAsync(deleteSql, toDeleteFlat),
        db.dbRunAsync(updateSql, toUpdateFlat)
    ])
};

exports.updatePageBlocks = (pageId, newBlocks) => {
    /* console.log(pageId);
    console.log(newBlocks); */
    const promises= [];
    promises.push(this.deletePageBlocks(pageId));
    promises.push(this.addPageBlocks(pageId, newBlocks));
    return Promise.all(promises);
}

/**
 * Forse posso fare un edit dei blocchi, con confronto per evitare inconsistenze
 */
exports.deletePageBlocks = (pageId) => {
    const sql = "delete from blocks where pageid = ?";
    return db.dbRunAsync(sql, [pageId]);
};