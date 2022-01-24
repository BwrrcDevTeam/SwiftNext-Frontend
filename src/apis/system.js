import {client} from "./index";

// 请求后端接口 /system/encrypt
export const encrypt = (data) => {
    return client.post('/system/encrypt', {content: data});
};

