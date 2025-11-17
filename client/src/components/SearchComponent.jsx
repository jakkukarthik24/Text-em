import React,{useState} from "react";
import "../css/SearchComponent.css";
export function SearchComponent(){
    const token=localStorage.getItem('token');
    const [query,setQuery]=useState('');
    const [results,setResults]=useState([]);
    const handleSearch=async(e)=>{
        const value=e.target.value;
        setQuery(value);
        if(value.trim()===""){
            setResults([]);
            return;
        }
        try{
            const response=await fetch(`http://localhost:5000/chat/search/${value}`,
                {
                    headers:{'Authorization':`Bearer ${token}`}
                }
            );
            const data=await response.json();
            setResults(data || []);
        }
        catch(err){
            console.error('Error searching users',err);
        }
    }
    return(
        <div className="search-panel">
            
            <input 
                type="text"
                placeholder="Search a user..."
                className="search-input"
                value={query}
                onChange={handleSearch}
            ></input>
            
            <div className="search-items">
                {results.length>0 && results.map((user)=>(
                    <div key={user.id} className="search-item">
                        {user.username}
                    </div>
                ))}
            </div>
        </div>
    )
}