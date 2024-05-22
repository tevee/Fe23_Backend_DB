//const express =  require('express'); //must be installed with npm
import express from "express";
//const ejs = require('ejs'); //must be installed with npm
import ejs from "ejs";
//const db = require('./db.js'); // Import the database module
import * as db from "./db.js"
//const bodyParser = require('body-parser');//must be installed with npm
import bodyParser from "body-parser";

//create variable representing express
const app = express();

//set public folder for static web pages
app.use(express.static('public'));

//set dynamic web pages, set views and engine
app.set('view engine', 'ejs');

// Set up body parser middleware to parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

////////////////Routing

let currentTable;
app.get('/', async (req, res) => {
    //res.send("hello World");//serves index.html
    const pageTitle = "Home";
    const sql = 'SHOW tables';
    const dbData = await db.query(sql);
    console.log(dbData);
    res.render('index', {pageTitle, currentTable, dbData} );
});

app.post('/', async (req, res) => {
    //res.send("hello World");//serves index.html
    //getting input data from the form
    console.log(req.body);
    const tableName = req.body;
    const pageTitle = "Home";
    const sql = `SELECT * FROM ${tableName.table_name}`;
    currentTable = tableName.table_name;
    const dbData = await db.query(sql);
    console.log('dbData', dbData);
    res.render('index', {pageTitle, currentTable, dbData} );
});

app.get('/removeData', async (req, res) => {
    //res.send("hello World");//serves index.html
    const pageTitle = "Remove Data";
    const sql = `SELECT * FROM ${currentTable}`;
    const dbData = await db.query(sql);
    console.log(dbData);
    const sql2 = `DESCRIBE ${currentTable}`;
    const dbDataHeaders = await db.query(sql2);
    res.render('removeData', {pageTitle, currentTable, dbData, dbDataHeaders} );
});
app.post('/removeData', async (req, res) => {
    //res.send("hello World");//serves index.html
    //getting input data from the form
    console.log(req.body);
    const requestData = req.body;
    const [keys, values] = [Object.keys(requestData).join(', '), Object.values(requestData).join(', ')];
    const pageTitle = "Remove Data";
    //execute delete query on a table.row
    const sqlDeleteQuery = `DELETE FROM ${currentTable} WHERE ${keys} = ${values}`;
    const deleteQuery = await db.query(sqlDeleteQuery);
    console.log(deleteQuery);
    //get table data
    const sql = `SELECT * FROM ${currentTable}`;
    const dbData = await db.query(sql);
    //get table headers
    const sql2 = `DESCRIBE ${currentTable}`;
    const dbDataHeaders = await db.query(sql2);
    console.log(dbDataHeaders);
    //show webpage to the user
    res.render('removeData', {pageTitle, currentTable, dbData, dbDataHeaders} );
});

app.get('/updateData', async (req, res) => {
    const pageTitle = "Update Data";
    const sql = `SELECT * FROM ${currentTable}`;
    const dbData = await db.query(sql);
    console.log('dbData', dbData);
    const sql2 = `DESCRIBE ${currentTable}`;
    const dbDataHeaders = await db.query(sql2);
    console.log('dbDataHeaders', dbDataHeaders);
    res.render('updateData', {pageTitle, currentTable, dbData, dbDataHeaders});
});

app.post('/updateData', async (req, res) => {
    const pageTitle = "Update Data";
    const requestData = req.body;
    console.log('reqeustData', requestData);
    
    const keys = Object.keys(requestData);
    const values = Object.values(requestData);
    const keyValuesArr = keys.map((key, i) => {
        const value = typeof values[i] === 'string' ? `'${values[i]}'` : values[i];
        return `${key} = ${value}`
    });

    const setClause = keyValuesArr.filter(requestData => !requestData.includes('_id')).join(', ');
    const whereClause = keyValuesArr.filter(requestData => requestData.includes('_id')).toString();

    const sqlUpdateQuery = `
        UPDATE ${currentTable}
        SET ${setClause}
        WHERE ${whereClause}
    `;
    const updateQuery = await db.query(sqlUpdateQuery, keyValuesArr);
    console.log(updateQuery);

    const sql = `SELECT * FROM ${currentTable}`;
    const dbData = await db.query(sql);
    console.log(dbData);

    const sql2 = `DESCRIBE ${currentTable}`;
    const dbDataHeaders = await db.query(sql2);
    res.render('updateData', {pageTitle, currentTable, dbData, dbDataHeaders});
});

app.get('/createTable', async (req, res) => {
    const pageTitle = "Create Table";
    const sql = `SELECT * FROM ${currentTable}`;
    const dbData = await db.query(sql);
    console.log(dbData);
    const sql2 = `DESCRIBE ${currentTable}`;
    const dbDataHeaders = await db.query(sql2);
    console.log('dbDataHeaders', dbDataHeaders);
    res.render('createTable', {pageTitle, currentTable, dbData, dbDataHeaders});
});

app.get('/createTableRow', async (req, res) => {
    const pageTitle = "Create New Table Row";
    const sql = `SELECT * FROM ${currentTable}`;
    const dbData = await db.query(sql);
    console.log(dbData);
    const sql2 = `DESCRIBE ${currentTable}`;
    const dbDataHeaders = await db.query(sql2);
    console.log('dbDataHeaders', dbDataHeaders);
    res.render('createTableRow', {pageTitle, currentTable, dbData, dbDataHeaders});
});

app.post('/createTableRow', async (req, res) => {
    const pageTitle = "Create New Table Row";
    const requestData = req.body;
    console.log('reqeustData', requestData);
    
    const keys = Object.keys(requestData).map(key => `${key}`).join(', ');
    const values = Object.values(requestData).map((value, i) => {
        const val = typeof value[i] === 'string' ? `'${value}'` : value;
        return `${val}`;
    }).join(', ');
    console.log('keys', keys);
    console.log('values', values);

    const sqlCreateQuery = `
        INSERT INTO ${currentTable}
        (${keys})
        VALUES (${values});
    `;
    const createQuery = await db.query(sqlCreateQuery, keys, values);
    console.log(createQuery);

    const sql = `SELECT * FROM ${currentTable}`;
    const dbData = await db.query(sql);
    console.log(dbData);

    const sql2 = `DESCRIBE ${currentTable}`;
    const dbDataHeaders = await db.query(sql2);
    res.render('createTableRow', {pageTitle, currentTable, dbData, dbDataHeaders});
});

// Return JSON table data

app.get('/tables', async (req, res) => {
    const sql = `SHOW TABLES`;
    const dbData = await db.query(sql);
    console.log(dbData);
    res.json(dbData);
})

app.get('/departments', async (req, res) => {
    let sql = '';
    const {department_id} = req.query;
    console.log(department_id);

    if(department_id) sql = `SELECT * FROM departments WHERE department_id = ${department_id}`;
    else sql = `SELECT * FROM departments`;

    const dbData = await db.query(sql);
    console.log(dbData);
    res.json(dbData);
})

app.get('/employees', async (req, res) => {
    let sql = '';
    const {employee_id} = req.query;

    if(employee_id) sql = `SELECT * FROM employees WHERE employee_id = ${employee_id}`;
    else sql = `SELECT * FROM employees`;

    const dbData = await db.query(sql);
    console.log(dbData);
    res.json(dbData);
})

app.get('/projects', async (req, res) => {
    let sql = '';
    const {project_id} = req.query;

    if(project_id) sql = `SELECT * FROM projects WHERE project_id = ${project_id}`;
    else sql = `SELECT * FROM projects`;

    const dbData = await db.query(sql);
    console.log(dbData);
    res.json(dbData);
})

//server configuration
const port = 3000;
app.listen(port, () => {
    console.log(`server is running on  http://localhost:${port}/`);
});