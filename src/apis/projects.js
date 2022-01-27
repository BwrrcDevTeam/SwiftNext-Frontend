import { client } from "./index"

function get_all_projects() {
  return client.get("/projects")
}

export default {
    get_all_projects
}
