import {client} from "./index";
import {time_to_db} from "../utils";


function get_week_report(session) {
//    获取本周的调查情况
    // 本周的开始时间
    let week_start = new Date(new Date().getTime() - (new Date().getDay() - 1) * 24 * 60 * 60 * 1000);
    week_start.setHours(0, 0, 0, 0);
    // 本周的结束时间
    let week_end = new Date(new Date().getTime() + (7 - new Date().getDay()) * 24 * 60 * 60 * 1000);
    week_end.setHours(23, 59, 59, 999);

    return client.get(`/records?uid=${session.user.id}&from=${time_to_db(week_start)}&to=${time_to_db(week_end)}`);
}

function get_count() {
//    获取项目的调查情况
    return client.get(`/records/count`);
}

function get_group_count(group_id) {
//    获取项目的调查情况
    return client.get(`/records/count?group_id=${group_id}`);
}

export default {
    get_week_report,
    get_count,
    get_group_count
}
