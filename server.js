const express = require('express')
const {Client} = require('pg')
const morgan = require('morgan')

const app = express(); 
const port = process.env.PORT || 3000; 
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost/acme_employees_db';

const client = new Client({
    connectionString: DATABASE_URL
});

app.use(express.json()); 
app.use(morgan('dev')); 

app.get('/api/employees', async(req, res, next) => {
    try{
        const SQL = `SELECT * FROM employees`;
        const response = await client.query(SQL); 
        res.send(response.rows);
    }catch(ex){
        next(ex);
    }
});

app.get('/api/departments', async(req, res, next) => {
    try{
        const SQL = `SELECT * FROM departments`; 
        const response = await client.query(SQL); 
        res.send(response.rows); 
    } catch(ex){
        next(ex);
    }
}); 

app.get('/api/employees', async(req, res, next) => {
    try{
        const {name, department_id} = req.body;
        const SQL = `INSERT INTO employees (name, department_id)
        VALUES ($1, $2)
        RETURNING *`; 
        const response = await client.query(SQL, [name, department_id]); 
        res.send(response.rows[0]); 
    } catch(ex){
        next(ex);
    }
}); 
app.put('/api/employees/:id', async (req, res, next) => {
    try{
        const {name, department_id} = req.body; 
        const {id} = req.params; 
        const SQL = `UPDATE employees
        SET name = $1, department_id = $2
        WHERE id = $3
        RETURNING *`;
const response = await client.query(SQL, [name, department_id, id]);
res.send(response.rows[0]); 
    }catch(ex){
        next(ex); 
    }
});


//error handling middleware

app.use((err, req, res, next) => {
    console.error(err.stack); 
    res.status(500).send({error: err.message}); 
});

const init = async () =>{
    try {
        await client.connect();
        console.log('Connected to the database'); 

        let SQL = `DROP TABLE IF EXISTS employees; 
        DROP TABLE IF EXISTS departments; 
        
        CREATE TABLE departments (
            id SERIAL PRIMARY KEY, 
            name VARCHAR(100)
        );
        
        CREATE TABLE employees(
            id SERIAL PRIMARY KEY, 
            name VARCHAR(100), 
            department_id INTEGER REFERENCES departments(id)
        );`;
        await client.query(SQL); 
        console.log('Tables created'); 
        
        SQL = `INSERT INTO departments (name) VALUES ('HR'), ('Engineering'),
        ('Sales'); 
        INSERT INTO employees (name, department_id) VALUES
        ('John Doe', (SELECT id FROM departments WHERE name='HR')), 
        ('Jane Smith', (SELECT id FROM departments WHERE name='Engineering')), 
        ('Same Green', (SELECT id FROM departments WHERE name='Sales'));`;

    await client.query(SQL); 
    console.log('Data seeded'); 

    app.listen(port, () => console.log(`Listening on port ${port}`)); 
    } catch(error){
        console.error('Error during initalization', error); 
    }
};