import React, {useEffect, useState} from 'react';
import jwt_decode from 'jwt-decode';

function Login() {
    const [user, setUser] = useState({});

    function handleCallbackResponse(response) {
        // console.log("encoded jwt" + response.credential);
        let userObject = jwt_decode(response.credential);
        console.log(userObject);
        setUser(userObject);
        document.getElementById("signInDiv").hidden = true;
    }

    function handleSignOut(e) {
        setUser({});
        document.getElementById("signInDiv").hidden = false;
    }


    useEffect(() => {
        /* global google */
        google.accounts.id.initialize({
            client_id: "157732301242-pjnfvvp4nsurv0uthkfrisdha5jt581a",
            callback: handleCallbackResponse
        });
        /* global google */
        google.accounts.id.renderButton(
            document.getElementById("signInDiv"), {
                theme: "outline", size: "large"
            }
        );

        google.accounts.id.prompt();
    }, []);


    return (
        <div className="App">
            <div id="signInDiv"></div>
            {Object.keys(user).length != 0 &&
                <button onClick={(e) => handleSignOut(e)}>Sign Out</button>
            }
            {user &&
                <div>
                    <img src={user.picture}/>
                    <h3>{user.name}</h3>
                </div>
            }
        </div>
    );
}

export default Login;