import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;
dotenv.config();
const pool=new Pool({
    user:process.env.db_user,
    host:process.env.db_host,
    database:process.env.db_name,
    password:process.env.db_password,
    port:process.env.db_port
});
export default pool;