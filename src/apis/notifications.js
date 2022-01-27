import { client } from "./index"

function get_notifications() {
  return client.get("/notifications")
}

export default {
    get_notifications
}
