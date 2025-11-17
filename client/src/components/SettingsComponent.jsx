import React,{useEffect} from "react";
import '../css/SettingsComponent.css'

export function SettingsComponent({userId,token,handleLogout}) {
    const [fetchUser,setFetchUser]=React.useState({});
    useEffect(()=>{
        const fetchUser=async()=>{
        try{
            const response=await fetch(`http://localhost:5000/chat/user/${userId}`,{
                headers:{'Authorization':`Bearer ${token}`}
            });
            const data=await response.json();
            setFetchUser(data);
            console.log(data);
        }
        catch(err){
            console.error('Error fetching user data',err);
        }
    }
    fetchUser();
    },[])
    return(
        <div className="settings-component">
            <div className="settings-top">
                <p>User ID: {fetchUser.id}</p>
                <p>Username: {fetchUser.username}</p>
                <p>Email: {fetchUser.email}</p>

                
            </div>
            <div className="settings-bottom">
                <button className="logout-btn" onClick={handleLogout}>Logout</button>            
            </div>
        </div>
    )
}   