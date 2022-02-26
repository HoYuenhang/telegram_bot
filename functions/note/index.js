import axios from "axios";
import url from "url";

// 接口地址
const api = new url.URL("http://botapi.kksan.top")

// 记事写入
function write(chatid, name, text) {
    // 组成接口
    api.searchParams.append("chatid", chatid)
    api.searchParams.append("name", name)
    api.searchParams.append("note", text)

    // 发起请求
    return axios.post(api.href)
        .then((res) => {
            if (res.data.code == 200) {
                return {
                    code: 200,
                    msg: "写入成功!"
                }
            } else {
                return {
                    code: 201,
                    msg: "写入失败,请重试!"
                }
            }
        })
        .catch((err) => {
            return {
                code: 201,
                msg: "写入失败,请重试!"
            }
        })
}

// 记事读取
function read(chatid) {
    // 组成接口
    api.searchParams.append("chatid", chatid)

    // 发起请求
    return axios.get(api.href)
        .then((res) => {
            if (res.data.code == 200) {
                return res.data.data
            } else {
                return []
            }
        })
        .catch((err) => {
            return []
        })
}

export {
    write as noteWrite,
    read as noteRead
}