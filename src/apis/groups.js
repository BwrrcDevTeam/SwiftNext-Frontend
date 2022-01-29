import {client } from './index';

function check_invitation(invitation_id) {
    return client.get("/groups/check_invitation/"+invitation_id)
}

function apply_invitation(invitation_id) {
    return client.get("/groups/apply_invitation/"+invitation_id)
}

function get_manageable_groups() {
    // 获取管理的群组
    return client.get("/groups/manageable")
}

export default {
    check_invitation,
    apply_invitation,
    get_manageable_groups
}
