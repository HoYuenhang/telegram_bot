import axios from "axios"
import url from "url"
import { Qingyun_token } from "../token/index.js"

function chat(text) {
    // 组成接口
    const api = new url.URL("http://api.qingyunke.com/api.php")
    api.searchParams.append("key", Qingyun_token)
    api.searchParams.append("appid", 0)
    api.searchParams.append("msg", text)

    // 发起请求
    return axios.get(api.href)
        .then((res) => {
            // console.log(res)
            if (res.data.result == 0) {
                return res.data.content
            } else {
                return "接口内部错误。"
            }
        })
        .catch((err) => {
            return "接口内部错误。"
        })
}

export { chat }