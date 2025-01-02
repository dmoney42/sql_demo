import React from 'react';
import { useState } from 'react'
import './App.css'

function App() {
  const [tableName, setTableName] = useState('');
   


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

          const data = await response.json();

        

        } catch (error) {
           console.log("There has been an error: " + error);
        }
        
    };
   
  return(
    <>
      <h1>Create Table</h1>
      <input type="text" 
             placeholder="Enter your table name..." 
             value={tableName}
             onChange={handleInputChange}
      />

      <button onClick={handleCreateTable}>Create Table</button>

    </>
  )
}

export default App
