import {client} from "./index";


// 请求后端接口 /users/check_email
export const check_email = (email) => {
    return client.post('/users/check_email', {email: email});
};
