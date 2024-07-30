import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {RegisterUser} from "../../apicalls/users";
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { HideLoader, ShowLoader } from '../../redux/loaderSlice';

function Register() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [user , setUser] = React.useState({
        name: "",
        email: "",
        password: ""
    })

    async function register() {
        try{
            dispatch(ShowLoader());
            const result = await RegisterUser(user);
            dispatch(HideLoader());
            if(result.success)
                {
                    toast.success(result.message);
                    setTimeout(() => {
                        window.location.href = "/Login";
                    }, "2050");
                }
            else
                {
                    toast.error(result.message);
                }
        }catch(err){
            dispatch(HideLoader());
            toast.error(err.message);
        }
    };

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
        const inputTxt = document.querySelector('#password');
        $result.textContent='';
      
        var passw=  /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{10,20}$/;
        if(validateEmail(email)){
            if(inputTxt.value.match(passw)) 
                { 
                    register();
                }
            else
                {
                    $result.textContent = "password should be between 10 to 20 characters which contain at least one numeric digit and a special character";
                    $result.style.color = 'red';
                }
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
        <div className="h-screen background-color flex items-center justify-center">
            
            <div className="bg-white shadow-md p-5 flex flex-col gap-5 w-96">
                <div className='flex gap-2'>
                    <i className="ri-chat-quote-fill text-2xl text-primary"></i>
                    <h1 className="text-2xl font-bold uppercase text-primary">Quick Chat Register</h1>
                </div>
                <hr />
                <input
                    type="text"
                    autocomplete="off"
                    placeholder="Enter your name"
                    value={user.name}
                    onChange={(event) => setUser({...user, name: event.target.value})} 
                />
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
                    id='password'
                    autocomplete="off"
                    placeholder="Enter your password"
                    value={user.password}
                    onChange={(event) => setUser({...user, password: event.target.value})} 
                />
                <button className={user.email&&user.password&&user.name ? "contained-button" : "disabled-btn"} onClick={()=>{validate()}}>Register</button>

                <Link to="/login" className="underline">
                    Already a member? Login
                </Link>
            </div>
        </div>
    )
}

export default Register