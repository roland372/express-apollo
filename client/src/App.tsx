import {useEffect, useState} from "react";
import './App.css';
import Login from './components/Login';
import LoginGoogle from './components/LoginGoogle';
import axios from "axios";

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            await fetch("http://localhost:5000/login/success", {
                method: "GET",
                credentials: "include",
                // @ts-ignore
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Credentials": true
                }
            }).then(response => {
                if (response.status === 200)
                    return response.json();
                throw new Error("authentication failed");
            }).then(resObject => {
                setUser(resObject.user);
            }).catch(err => {
                console.log(err);
            });
        };
        getUser();
    }, []);

    console.log(user);

    return (
        <div className="App">
            {/*<Login/>*/}
            <LoginGoogle/>
        </div>
    );
}

export default App;
