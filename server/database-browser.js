const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = 3002;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

app.use(express.static('public'));
app.use(express.json());

// Serve the database browser interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>ScoutBook Database Browser</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .tables-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
            .table-card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.2s; }
            .table-card:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
            .query-section { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            textarea { width: 100%; height: 100px; margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
            button { background: #3498db; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background: #2980b9; }
            .results { margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; background: white; }
            th, td { padding: 8px 12px; border: 1px solid #ddd; text-align: left; }
            th { background: #f8f9fa; font-weight: bold; }
            .error { background: #e74c3c; color: white; padding: 10px; border-radius: 4px; margin: 10px 0; }
            .success { background: #27ae60; color: white; padding: 10px; border-radius: 4px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🗄️ ScoutBook Database Browser</h1>
                <p>Connected to PostgreSQL database: <strong>${process.env.DB_NAME}</strong></p>
            </div>
            
            <div class="tables-grid" id="tablesGrid">
                <!-- Tables will be loaded here -->
            </div>
            
            <div class="query-section">
                <h3>🔍 Custom SQL Query</h3>
                <textarea id="sqlQuery" placeholder="Enter your SQL query here...
Example: SELECT * FROM users LIMIT 10;"></textarea>
                <br>
                <button onclick="executeQuery()">Execute Query</button>
                <button onclick="loadSampleQueries()">Sample Queries</button>
            </div>
            
            <div class="results" id="results"></div>
        </div>

        <script>
            // Load tables on page load
            window.onload = function() {
                loadTables();
            };

            async function loadTables() {
                try {
                    const response = await fetch('/api/tables');
                    const tables = await response.json();
                    
                    const grid = document.getElementById('tablesGrid');
                    grid.innerHTML = tables.map(table => 
                        \`<div class="table-card" onclick="showTable('\${table.table_name}')">
                            <h4>📋 \${table.table_name}</h4>
                            <p>Click to view data</p>
                        </div>\`
                    ).join('');
                } catch (error) {
                    console.error('Error loading tables:', error);
                }
            }

            async function showTable(tableName) {
                document.getElementById('sqlQuery').value = \`SELECT * FROM \${tableName} LIMIT 20;\`;
                executeQuery();
            }

            async function executeQuery() {
                const query = document.getElementById('sqlQuery').value;
                const resultsDiv = document.getElementById('results');
                
                if (!query.trim()) {
                    resultsDiv.innerHTML = '<div class="error">Please enter a SQL query</div>';
                    return;
                }
                
                try {
                    resultsDiv.innerHTML = '<p>Executing query...</p>';
                    
                    const response = await fetch('/api/query', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query })
                    });
                    
                    const result = await response.json();
                    
                    if (result.error) {
                        resultsDiv.innerHTML = \`<div class="error">Error: \${result.error}</div>\`;
                        return;
                    }
                    
                    if (result.rows && result.rows.length > 0) {
                        const table = createTable(result.rows);
                        resultsDiv.innerHTML = \`
                            <div class="success">Query executed successfully! Found \${result.rows.length} rows.</div>
                            \${table}
                        \`;
                    } else {
                        resultsDiv.innerHTML = '<div class="success">Query executed successfully! No rows returned.</div>';
                    }
                } catch (error) {
                    resultsDiv.innerHTML = \`<div class="error">Error: \${error.message}</div>\`;
                }
            }

            function createTable(rows) {
                if (rows.length === 0) return '<p>No data found</p>';
                
                const headers = Object.keys(rows[0]);
                const headerRow = headers.map(h => \`<th>\${h}</th>\`).join('');
                const dataRows = rows.map(row => 
                    \`<tr>\${headers.map(h => \`<td>\${row[h] || ''}</td>\`).join('')}</tr>\`
                ).join('');
                
                return \`<table><thead><tr>\${headerRow}</tr></thead><tbody>\${dataRows}</tbody></table>\`;
            }

            function loadSampleQueries() {
                const samples = [
                    "SELECT * FROM users LIMIT 10;",
                    "SELECT COUNT(*) as total_users FROM users;",
                    "SELECT * FROM opportunities WHERE deadline > NOW();",
                    "SELECT u.name, u.email, u.role FROM users u ORDER BY u.created_at DESC LIMIT 5;",
                    "SELECT t.name, t.start_date, t.location FROM tournaments t ORDER BY t.start_date;",
                    "SELECT COUNT(*) as total_videos FROM videos;"
                ];
                
                document.getElementById('sqlQuery').value = samples.join('\\n\\n-- ');
            }
        </script>
    </body>
    </html>
  `);
});

// API endpoint to get all tables
app.get('/api/tables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to execute queries
app.post('/api/query', async (req, res) => {
  try {
    const { query } = req.body;
    const result = await pool.query(query);
    res.json({ rows: result.rows, rowCount: result.rowCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🌐 Database browser running at http://localhost:${port}`);
  console.log('📊 You can now browse your database in the web interface!');
});