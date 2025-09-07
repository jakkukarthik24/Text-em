import React,{useState} from "react";
import { useNavigate } from "react-router-dom";
function Home(){
    const [profile,setProfile]=useState(null);
    const navigate = useNavigate();
    const getProfile=async()=>{
        const token=localStorage.getItem("token");
        if(!token){
            alert("No token found");
            return;
        }
        try{
            const response=await fetch('http://localhost:5000/api/profile',{
                headers:{
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!response.ok) {
                throw new Error("Unauthorized or bad token");
            }
            alert("Profile fetched successfully");
            const data=await response.json();
            setProfile(data.user);
        }
        catch(err){
            alert("Failed to fetch profile:", err);
        }
    }
    return (
        <div>
            <h1>Chat App</h1>
            <button onClick={getProfile}>Get profile</button>
            {profile && (
            <div>
                <h2>Profile Information</h2>
                <p>ID: {profile.id}</p>
                <p>Username: {profile.username}</p>
                <p>Email: {profile.email}</p>
            </div>
            )}
        </div>
    )
}
export default Home;