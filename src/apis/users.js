import {client} from "./index";


// 请求后端接口 /users/check_email
function check_email(email) {
    return client.post('/users/check_email', {email: email})
}


function login(email, password) {
    return client.post('/users/login', {email: email, password: password})
}

function logout() {
    return client.get('/users/logout')
}



export default {
    check_email,
    login,
    logout
};
