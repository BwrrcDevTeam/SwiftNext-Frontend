import axios from "axios";
import {encrypt} from "./system";
// import {check_email} from './users';
import users from "./users";
import records from "./records";
import notifications from "./notifications";
import projects from "./projects";
import groups from "./groups";
import storage from "./storage"

const config = {
    // baseURL: "https://console.bwrrc.org.cn/api/",
    baseURL: "http://192.168.1.50:8000/api/", // 调试时使用
    timeout: 10000,
    // socket: "wss://console.bwrrc.org.cn/api/",
}

const client = axios.create(config)

// Colorful的调试信息! ╰(*°▽°*)╯
// API动作的颜色
const action = "background: #70c0e8; color: #000; padding: 0 5px; border-radius: 3px; background-clip: border-box;";
// 谁给谁发?
const orientation = "background: #63e2b7; color: #67676a; padding: 0 5px; border-radius: 3px; background-clip: border-box;";
// 发送的信息
const error = "background: #e88080; color: #000; padding: 0 5px; border-radius: 3px; background-clip: border-box;";

const blank = "background: rgba(0, 0, 0, 0);";

client.defaults.withCredentials = true;
client.defaults.crossDomain = true;

// 向服务器问好，初始化session
function init_session() {
    return client.get("/")
}

function log_api(_action, _orientation, _message) {
    console.log(`%c${_action}%c %c${_orientation}%c: %c${_message}`, action, blank, orientation, blank);
}

function log_error(_orientation, _message) {
    console.warn(`%cAPI错误 %c %c${_orientation}%c: %c${_message}`, error, blank, orientation, blank);
}

// 获取当前会话状态 并写入SessionStorage
async function update_session() {
    log_api("向服务器问好", "Client => Server", "Hi~ o(*￣▽￣*)ブ");

    let resp = await init_session();
    log_api("服务器回应!", "Server => Client", resp.data.message);
    let perm_map = {
      0: "访客",
      1: "志愿者",
      2: "组长",
      3: "管理员"
    }
    console.log("用户的权限:\t", perm_map[resp.data.session.permission])
    console.log("创建了新的会话?\t", resp.data.session_need_update);
    console.log("是否登陆?\t", resp.data.session.login);
    sessionStorage.setItem("session",JSON.stringify(resp.data.session));
    return resp.data.session;
}

export {
    client,
    init_session,
    update_session,
    encrypt,
    users,
    log_api,
    log_error,
    config,
    records,
    notifications,
    projects,
    groups,
    storage
}
