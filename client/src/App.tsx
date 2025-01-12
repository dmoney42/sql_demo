import React from 'react';
import { useState } from 'react'
import './App.css'

function App() {
  const [tableName, setTableName] = useState('');
  const [tableData, setTableData] = useState([]);
  


  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) =>{
      setTableName(event.target.value);
  }

   const handleCreateTable = async () => {

        if (tableName.trim() === "") {
            alert("Please enter a table name");
            return;
        }
    
        //making a request to the backend to create table
        try {
          const response = await fetch('http://localhost:8080/api/createTable',{
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tableName: tableName.trim() })
          });

          if (!response.ok) {
            const data = await response.json();
            //2 types of messages you can display from the server response
            console.warn("Server returned an error:", data);
            console.error("we did get a response from the server. Here is the error:", data);
            return;
          }

          const data = await response.json();
          console.log("the response was ok heres the message: " + JSON.stringify(data.message));
          //Now fetch the table
          fetchCreateTable();

        } catch (error) {
           console.log("There has been an error: " + error);
        }
    };

    const handleAlterTable = async () =>{
         try {
          const response = await fetch('http://localhost:8080/api/alterTableData',{
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({tableName}),
          });

          if (!response.ok) {
            const data = await response.json();
            //2 types of messages you can display from the server response
            console.warn("Server returned an error:", data);
            console.error("we did get a response from the server to alter the table. Here is the error:", data);
            return;
          }
          
           //Now fetch the table
           fetchCreateTable();
         } catch (error) {
            console.log("There has been an error with your alter request: " + error);
         }
    };


    const fetchCreateTable = async () => {
      console.log("You're in the fetchCreateTable function");
      
      try {
        const response = await fetch(`http://localhost:8080/api/getTableData?tableName=${tableName.trim()}`);
        if(!response.ok){
          console.error("We did not get a respose back to fetch the table!",response.status, response.statusText);
          return;
        }
        const data = await response.json();
        if(!Array.isArray(data) || data.length === 0){
          console.warn("Theres no data in this table we fetched");
        }
        setTableData(data);
        console.log("The contents of the table we received back from the server is: " + JSON.stringify(data));
      } catch (error) {
        console.log("There has been an error fetching the table: " + error);
      }
        
    };
   
  return(
    <>
      <h1>Create Table</h1>
      <p>Enter the table name "customers"</p>
      <input type="text" 
             placeholder="Enter your table name..." 
             value={tableName}
             onChange={handleInputChange}
      />

      <button onClick={handleCreateTable}>Create Table</button>

      {tableData.length > 0 && (
                <table border="1" style={{ marginTop: '20px', width: '100%' }}>
                    <thead>
                        <tr>
                            {/* Dynamically render column headers */}
                            {Object.keys(tableData[0]).map((key) => (
                                <th key={key}>{key}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Dynamically render rows */}
                        {tableData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {Object.values(row).map((value, colIndex) => (
                                    <td key={colIndex}>{value}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

      <h1>Alter Table</h1>    
      <p>Click the button below to alter the table's data</p>
      <button onClick={handleAlterTable}>Alter</button> 

      {tableData.length > 0 && (
                <table border="1" style={{ marginTop: '20px', width: '100%' }}>
                    <thead>
                        <tr>
                            {/* Dynamically render column headers */}
                            {Object.keys(tableData[0]).map((key) => (
                                <th key={key}>{key}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Dynamically render rows */}
                        {tableData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {Object.values(row).map((value, colIndex) => (
                                    <td key={colIndex}>{value}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}      

    </>
  )
}

export default App
