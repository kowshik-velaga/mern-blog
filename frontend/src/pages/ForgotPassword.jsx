import axios from 'axios';
import {URL} from '../url';
import { useState } from "react";
import { Link,useNavigate } from 'react-router-dom';


const ForgotPassword =()=>{
    const [email,setEmail]=useState("");
    const [username,setUsername] = useState("");
    const [password,setPassword] = useState("");
    const [error, setError] = useState(false);
    const navigate = useNavigate();
    const handleforgot= async()=>{
        try{
            const res = await axios.post(
                URL+"/api/auth/forgotpassword",
                {email,username,password}
                );
                navigate("/forgotpasswordsuccesful");
        }
        catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
              setError(err.response.data.error);
            } else {
              setError("Something went wrong");
            }
            console.log(err);}
    }
    return(
        <>
        <div className="flex items-center justify-between px-6 md:px-[200px] py-4">
        <h1 className="text-lg md:text-xl font-extrabold"><Link to="/">Crisis Management</Link></h1>
        </div>
        <div className="w-full flex justify-center items-center h-[80vh] ">
        <div className="flex flex-col justify-center items-center space-y-4 w-[80%] md:w-[25%]">
        <h1 className="text-xl font-bold text-left">Forgot Password?</h1>
        <input  onChange={(e)=>setUsername(e.target.value)} className="w-full px-4 py-2 border-2 border-black outline-0" type="text" placeholder="Enter your Username" />
        <input  onChange={(e)=>setEmail(e.target.value)} className="w-full px-4 py-2 border-2 border-black outline-0" type="text" placeholder="Enter your email" />
        <input  onChange={(e)=>setPassword(e.target.value)} className="w-full px-4 py-2 border-2 border-black outline-0" type="password" placeholder="Enter New Password" />
        <button onClick={handleforgot} className="w-full px-4 py-4 text-lg font-bold text-white bg-black rounded-lg hover:bg-gray-500 hover:text-black ">Reset Password</button>
        {error && <h3 className="text-red-500 text-sm ">{error}</h3>}
        </div>
        </div>
        </>
    )
}
export default ForgotPassword;