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

export default {
    get_upload_url,
    delete_file,
    detect_image
}
