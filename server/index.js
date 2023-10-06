'use strict';

const express = require('express');
const cors = require('cors');

const dayjs = require('dayjs');
const { check, validationResult } = require('express-validator');
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};
const blocksValidationFunction = (blocks) => {
  const hpi = [0,0,0];
  blocks.forEach(b => {
    if(b.content==="") {
      throw new Error("Empty block content not valid")
    } else {
      if(b.type==="header") hpi[0] = 1;
      else if(b.type==="paragraph") hpi[1] = 1;
      else if(b.type==="image") hpi[2] = 1;
      else throw new Error("Block type field value not valid");
    }
  });
  const shpi = hpi.join("");
  if(!(shpi==="110"||shpi==="101"||shpi==="111")) throw new Error("Minimum types of blocks not reached");
  return true;
}

const passport = require('passport');

const pagesDao = require('./dao-pages');
const blocksDao = require('./dao-blocks');
const titleDao = require('./dao-title');
const usersDao = require('./dao-users');

// init express
const app = new express();
const port = 3001;

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use("/static",
express.static("images"));

const { initAuthentication, isLoggedIn } = require('./auth.js');

initAuthentication(app);

/**
 * FRONT-OFFICE/BACK-OFFICE APIs
 */

/**
 * Get the list of all pages -> [(id, userId, title, author, creationDate, publicationDate),..]
 */
app.get("/api/pages", [
  check('filter').matches(/published|all/).withMessage('Used filter is not valid')
], async (req, res) => {
  const result = validationResult(req).formatWith(errorFormatter);
  if (!result.isEmpty()) {
    return res.status(422).json({ errors: result.array() });
  }
  const filter = req.query.filter;
  if(filter==="all") {
    if(!req.isAuthenticated())
      return res.status(401).json({ errors: ['Not authenticated'] });
  }
  try {
    const pages = await pagesDao.listPages();
    const filtered = [];
    if(filter==="published") {
      filtered.push(...pages.filter((p) => dayjs().diff(dayjs(p.publicationDate), 'day')>=0));
    } else filtered.push(...pages);
    pages.map((p) => {p.publicationDate?p.publicationDate:""});
    res.json(filtered);
  } catch(err) {
    res.status(500).json({ errors: ["Database error"] });
  }
});

/**
 * Get the content of the page given the id -> [(id, pageId, index, type, content),..]
 */
app.get("/api/pages/:id", [
  check('id').isInt({min: 1}).withMessage('Negative id not valid')
], async (req, res) => {
  const result = validationResult(req).formatWith(errorFormatter);
  if (!result.isEmpty()) {
    return res.status(422).json({ errors: result.array() });
  }
  try {
    const id = req.params.id;
    const page = await pagesDao.getPageByPageId(id);
    if(!page)
      return res.status(404).json({ errors: ["Page not found"] });
    // not authenticated user is trying to fetch a not published page
    const published = dayjs().diff(dayjs(page.publicationDate),'day')>=0;
    if((!published) && (!req.isAuthenticated()))
      return res.status(401).json({ errors: ['Page not published'] });
    const pageBlocks = await blocksDao.listPageBlocks(id);
    if(!pageBlocks)
      return res.status(404).json({ errors: ["Page blocks not found"] });
    page.publicationDate = page.publicationDate?page.publicationDate:"";
    res.json({page: page, pageBlocks: pageBlocks});
  } catch(err) {
    res.status(500).json({ errors: ["Database error"] });
  }
});

/**
 * Get the title of the main page
 */
app.get("/api/title", async (req, res) => {
  try {
    const title = await titleDao.getMainTitle();
    if(!title)
      return res.status(404).json({ errors: ["Title not found"] });
    res.json(title);
  } catch(err) {
    res.status(500).json({ errors: ["Database error"] });
  }
});

/**
 * BACK OFFICE SPECIFIC APIs
 */

/**
 * Add a new page
 */
app.post("/api/pages",
  isLoggedIn,
[
  check('page.title').isLength({min: 1}).withMessage('Empty page title not valid'),
  check('page.publicationDate').isLength({min: 10, max: 10}).isISO8601({strict: true}).optional({checkFalsy: true}).withMessage('Publication date field not valid.'),
  check('page.creationDate').isLength({min: 10, max: 10}).isISO8601({strict: true}).optional({checkFalsy: true}).withMessage('Creation date field not valid.'),
  check('blocks').custom(blocksValidationFunction)
], async (req, res) => {
  const result = validationResult(req).formatWith(errorFormatter);
  if (!result.isEmpty()) {
    return res.status(422).json({ errors: result.array() });
  }
  const newPage = {
    userId: req.user.id,
    title: req.body.page.title,
    author: req.user.name,
    creationDate: dayjs().format("YYYY-MM-DD"),
    publicationDate: req.body.page.publicationDate
  }
  const newBlocks = req.body.blocks.map((b, i) => {
    return {
      index: i,
      type: b.type,
      content: b.content
    }
  });
  try {
    const newPageId = await pagesDao.addPage(newPage);
    await blocksDao.addPageBlocks(newPageId, newBlocks);
    res.json(newPageId);
  } catch(err) {
    res.status(500).json({ errors: ["Database error"] });
  }
});

/**
 * Modify an existing page, with admin and normal user managing
 */
app.put("/api/pages/:id",
  isLoggedIn,
[
  check('id').isInt({min: 1}).withMessage('Negative id not valid'),
  check('page.title').isLength({min: 1}).withMessage('Empty page title not valid'),
  check('page.publicationDate').isLength({min: 10, max: 10}).isISO8601({strict: true}).optional({checkFalsy: true}).withMessage('Creation date field not valid.'),
  check('blocks').custom(blocksValidationFunction)
], async (req, res) => {
  const result = validationResult(req).formatWith(errorFormatter);
  if (!result.isEmpty()) {
    return res.status(422).json({ errors: result.array() });
  }
  const pageId = req.params.id;
  const newPage = {
    title: req.body.page.title,
    publicationDate: req.body.page.publicationDate
  }
  const newBlocks = req.body.blocks.map((b, i) => {
    return {
      index: i,
      type: b.type,
      content: b.content
    }
  });
  try {
    const page = await pagesDao.getPageByPageId(pageId);
    if(!page) 
      return res.status(404).json({ errors: ["Page not found"] });
    const newUserId = req.user.admin && req.body.userId;
    if(!newUserId) {
      // not an admin || admin modifying his own page?? =>
      if(page.userId!=req.user.id)
        return res.status(403).json({ errors: ["Forbidden"] });
      newPage.userId = req.user.id;
      newPage.author = req.user.name;
    } else {
      // admin =>
      const newAuthor = await usersDao.getUserById(newUserId);
      if(!newAuthor)
        return res.status(404).json({ errors: ["User not found"] });
      newPage.userId = newAuthor.id;
      newPage.author = newAuthor.name;
    }
    await blocksDao.updatePageBlocks(pageId, newBlocks);
    await pagesDao.updatePageById(pageId, newPage);
    const result = await pagesDao.getPageByPageId(pageId);
    res.json(result.id);
  } catch(err) {
    res.status(500).json({ errors: ["Database error"] });
  }
});

/**
 * Delete an existing page
 */
app.delete("/api/pages/:id",
  isLoggedIn,
[
  check("id").isInt({min: 1}).withMessage('Negative id not valid'),
], async (req, res) => {
  const result = validationResult(req).formatWith(errorFormatter);
  if (!result.isEmpty()) {
    return res.status(422).json({ errors: result.array() });
  }
  const pageId = req.params.id;
  try {
    const page = await pagesDao.getPageByPageId(pageId);
    if(!page)
      return res.status(404).json({ errors: ["Page not found"] });
    if(!req.user.admin) {
      // not an admin =>
      if(page.userId!=req.user.id) {
        return res.status(403).json({ errors: ["Forbidden"] });
      }
    }
    await blocksDao.deletePageBlocks(pageId);
    await pagesDao.deletePageById(pageId);
    res.json({});
  } catch(err) {
    res.status(500).json({ errors: ["Database error"] });
  }
});

/**
 * ADMIN
 */

/**
 * Modify site title
 */
app.put("/api/title",
  isLoggedIn,
[
  check("title").isLength({min: 1}).withMessage('Empty site title not valid')
], async (req, res) => {
  const result = validationResult(req).formatWith(errorFormatter);
  if (!result.isEmpty()) {
    return res.status(422).json({ errors: result.array() });
  }
  const title = req.body.title;
  try {  
    if(!req.user.admin) {
      res.status(403).json({ errors: ["Forbidden"] });
      return;
    }
    await titleDao.updateMainTitle(title);
    res.json(title);
  } catch(err) {
    res.status(500).json({ errors: ["Database error"] });
  }
});
/**
 * Get user list
 */
app.get("/api/users",
  isLoggedIn,
async (req, res) => {
  try {
      if(req.user.admin) {
        const result = await usersDao.listUsers();
        return res.json(result);
      }
      return res.status(403).json({ errors: ["Forbidden"] });
    } catch(err) {
      res.status(500).json({ errors: ["Database error"] });
    }
  }
)

/**
 * USER AUTHENTICATION
 */
/**
 * Login
 */
app.post("/api/sessions", function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if(err)
      return next(err);
    if(!user)
      return res.status(401).json({ errors: [info] });
    req.login(user, (err) => {
      if(err)
        return next(err);
      return res.json(req.user);
    });
  })(req, res, next);
})
/**
 * Check if the user is logged in or not
 */
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated())
    res.status(200).json(req.user)
  else
    res.status(401).json({ errors: ['Not authenticated'] });
});
/**
 * Logout
 */
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
