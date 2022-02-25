import {client, config} from './index'


function get_upload_url() {
    return config.baseURL + "storage"
}

function delete_file(file_id) {
    return client.delete("/storage/" + file_id)
}

function detect_image(fid) {
    return client.post("/detector/task", {
        attachment_id: fid
    })
}

function get_inline_url(fid) {
    return config.baseURL + "storage/inline/" + fid
}

function get_thumbs_url(fid, width, height) {
    return config.baseURL + "storage/inline/" + fid + "/w/" + width + "/h/" + height
}

function get_download_url(fid) {
    return config.baseURL + "storage/download/" + fid
}

function get_draw_url(task_id, threshold) {
    return config.baseURL + "detector/" + task_id + "/draw?threshold=" + threshold
}

export default {
    get_upload_url,
    get_inline_url,
    get_download_url,
    get_thumbs_url,
    delete_file,
    get_draw_url
}
