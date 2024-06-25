const init = async() => {
    try{
        await client.connect(); 
        console.log('connected to the database'); 

        let SQL = `DROP TABLE IF EXISTS employees; 
        DROP TABLE IF EXISTS departments; 
        
        CREATE TABLE departments (
            id SERIAL PRIMARY KEY, 
            name VARCHAR(100)
        ); 
        CREATE TABLE employees (
            id SERIAL PRIMARY KEY, 
            name VARCHAR(100), 
            department_id INTEGER REFERENCES departments(id)
        );`;

        await client.query(SQL);
        console.log('Tables created');

        SQL = `INSERT INTO departments (name) VALUES ('HR'), ('Engineering'), ('Sales'); 
        INSERT INTO employees (name, department_id) VALUES
        ('John Doe', (SELECT id FROM departments WHERE name='HR')), 
        ('Jane Smith', (SELECT id FROM departments WHERE name='Engineering')), 
        ('Sam Green', (SELECT id FROM departments WHERE name='Sales'));`;

        await client.query(SQL); 
        console.log('Data seeded'); 

        app.listen(port, () => console.log(`Listening on port ${port}`)); 
    } catch(error) {
        console.error('Error during initialization:', error);
    }
}

init();