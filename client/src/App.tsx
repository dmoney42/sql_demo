import React from 'react';
import { useState } from 'react'
import './App.css'

function App() {
  const [tableName, setTableName] = useState('');
  const [tableName2, setTableName2] = useState('');
  const [tableData, setTableData] = useState([]);
  const [groupedData, setGroupedData] = useState([]); //state variables for grouped table data
  const [groupedByFirstLetterData, setGroupedByFirstLetter] = useState([]); // State for grouped data
  const [successMessage, setSuccessMessage] = useState('');

  


  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) =>{
      setTableName(event.target.value);
  }

  const handleInputChange2 = (event: React.ChangeEvent<HTMLInputElement>) =>{
    setTableName2(event.target.value);
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


        } catch (error) {
           console.log("There has been an error: " + error);
        }
    };

    const handlePopulateCustomers = async () => {
        console.log("You're inside the handlePopulateCustomers function. The table name we want to populate is: " + tableName);
        if (tableName.trim() === "") {
          alert("Please enter a table name");
          return;
        }      

        try {
          const response = await fetch('http://localhost:8080/api/populateCustomers',{
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tableName: tableName.trim() })
          });  

          const responseData = await response.json();
          setSuccessMessage(responseData.message);
          
          console.log("After requesting to populate the table heres the response we got back: " + JSON.stringify(responseData));

          //Now fetch the table
          fetchCreateTable();          

        } catch (error) {
          console.log("There has been an error trying to populate customers: " + error);
          setSuccessMessage("An error occurred while populating the table.");

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

    const handleGroupByCountry = async () => {
      console.log("Youre inside of the handleGroupByCountry function");

      try {
        const response = await fetch(`http://localhost:8080/api/groupByCountry?tableName=${tableName.trim()}`,{
          method: 'GET',
        });
        
        if(!response.ok){
           const errorData = await response.json();
           console.log("There was an error with your group by city request" + errorData);
           return;
        }

        const data = await response.json();
        setGroupedData(data);

        //Now fetch the table
        fetchCreateTable();        

      } catch (error) {
        console.log("Error fetching grouped table data: " + error)
      }

    }



    const groupCountriesByFirstLetter = async() =>{
        console.log("Youre inside the groupCountriesByFirstLetter");
        console.log("The table name passed into groupCountriesByFirstLetter is: " + tableName);

        try {
          const response = await fetch(`http://localhost:8080/api/groupCountriesByFirstLetter?tableName=${tableName.trim()}`,{
            method: 'GET',
          });
          
          
          if (!response.ok) {
            const data = await response.json();
            //2 types of messages you can display from the server response
            console.warn("Server returned an error:", data);
            console.error("we got an error response from the server to alter the table. Here is the error:", data);
            return;
          }

          const data = await response.json();
          console.log("The response we got back from the server when we tried to group countries by first letter is: " + JSON.stringify(data));
         
          if(!data){
            console.log("We did not get a resposne back from the server when we requested to group countries by first letter U");
            return;
          }
          setGroupedByFirstLetter(data);

        } catch (error) {
          console.log("There has been an error with your group countries by first letter request: " + error);
        }
 
     };


     const handleJoinTables = async () =>{
      console.log("You are inside the handleJoinTables function. We want to join: " + tableName + " and " + tableName2);
    

     }


    


   
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
      <p>Click the button below to populate the table with customers</p>
      <button onClick={handlePopulateCustomers}>Populate Customers</button>
      {successMessage && <p style={{ color: 'green', marginTop: '10px' }}>{successMessage}</p>}

      
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



      <h1>Group The Table</h1>    
      <p>Click the button below to group the table by Country</p> 
      <button onClick={handleGroupByCountry}>Group By Country</button>          
      {groupedData.length > 0 && (
                <table border="1" style={{ marginTop: '20px', width: '100%' }}>
                    <thead>
                        <tr>
                            {/* Dynamically render column headers */}
                            {Object.keys(groupedData[0]).map((key) => (
                                <th key={key}>{key}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Dynamically render rows */}
                        {groupedData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {Object.values(row).map((value, colIndex) => (
                                    <td key={colIndex}>{value}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}   
      



      <h1>Group The Table By String (First Letter)</h1>    
      <p>This statement is a bit more complex and utilizes all statements that all under Data Query Language (DQL)</p>
      <p>Click the button below to utilize Data Query Language (DQL)</p> 
      <button onClick={groupCountriesByFirstLetter}>Group By Countries that starts with U</button> 
      {groupedByFirstLetterData.length > 0 && (
                <table border="1" style={{ marginTop: '20px', width: '100%' }}>
                    <thead>
                        <tr>
                            <th>Country</th>
                            <th>Customer Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groupedByFirstLetterData.map((row, index) => (
                            <tr key={index}>
                                <td>{row.country}</td>
                                <td>{row.customer_count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
            )}



      <h1>INNER JOINS</h1>    
      <p>This statement utilizes Data Query Language (DQL) INNER JOIN statement</p>
      <p>Enter another table name below and it will be joined with the first table you created</p>
      <input type="text" 
             placeholder="Enter your table name..." 
             value={tableName2}
             onChange={handleInputChange2}
      />
      
      <button onClick={handleJoinTables}>Create Second Table and Join</button>      

    </>
  )
}

export default App
