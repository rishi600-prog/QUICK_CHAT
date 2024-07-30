import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {LoginUser} from "../../apicalls/users";
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { HideLoader, ShowLoader } from '../../redux/loaderSlice';

function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [user , setUser] = React.useState({
        email: "",
        password: ""
    })

    async function loginUser() {
        try{
            dispatch(ShowLoader());
            const result= await LoginUser(user);
            dispatch(HideLoader());
            if(result.success)
                {
                    toast.success(result.message);
                    localStorage.setItem("token", result.data);
                    window.location.href = "/";
                }
            else
                {
                    toast.error(result.message);
                }
        }catch(err){
            dispatch(HideLoader());
            toast.error(err.message);
        }
    }

    function validateEmail(email) 
    {
        return email.match(
          /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };
      
    function validate() 
    {
        const $result = document.querySelector('#result');
        const email = document.querySelector('#email').value;
        $result.textContent='';
      
        if(validateEmail(email)){
          loginUser();
        } else{
          $result.textContent = email + ' is Invalid email.';
          $result.style.color = 'red';
        }
        return false;
    }

    useEffect(() => {
        if(localStorage.getItem("token"))
            {
                navigate("/");
            }
    }, []);

    return (
            <div className="h-screen flex items-center justify-center background-color">
                <div className="bg-white shadow-md p-5 flex flex-col gap-5 w-96">
                    <div className='flex gap-2'>
                        <i className="ri-chat-quote-fill text-2xl text-primary"></i>
                        <h1 className="text-2xl font-bold uppercase text-primary">Quick Chat Login</h1>
                    </div>
                    <hr />

                    <input
                        type="email"
                        id='email'
                        autocomplete="off"
                        placeholder="Enter your email"
                        value={user.email}
                        onChange={(event) => setUser({...user, email: event.target.value})} 
                    />
                    <p id='result'></p>
                    <input
                        type="password"
                        autocomplete="off"
                        placeholder="Enter your password"
                        value={user.password}
                        onChange={(event) => setUser({...user, password: event.target.value})} 
                    />
                    <button className={user.email&&user.password ? "contained-button" : "disabled-btn"} onClick={validate}>Login</button>

                    <Link to="/register" className="underline">
                        Don't have an account? Register
                    </Link>
                </div>
            </div>
    )
}

export default Login