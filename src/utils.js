import moment from 'moment';

function time_from_db(db_stamp) {
    // 将数据库内存储的UNIX UTC时间戳转换为本地时间
    return moment.utc(db_stamp * 1000).toDate();
}

function time_to_db(local_time) {
    // 将本地时间转换为数据库内存储的UNIX UTC时间戳
    return moment(local_time).utc().unix();
}

export { time_from_db, time_to_db };
