import url from "url"
import axios from "axios"
import md5 from "md5";
import { baiduTranslate } from "../token/index.js";

// 百度翻译key
var appid = baiduTranslate.appid
var key = baiduTranslate.key

var salt = (new Date).getTime();
var query = '私は李さんです';
// 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
var from = 'jp';
var to = 'zh';

// 语种识别
function checkLanguage(text) {
    // 生成sign
    var str1 = appid + text + salt + key;
    var sign = md5(str1)

    // 组成api
    let api = new url.URL("https://fanyi-api.baidu.com/api/trans/vip/language")
    api.searchParams.append("q", text)
    api.searchParams.append("appid", appid)
    api.searchParams.append("salt", salt)
    api.searchParams.append("sign", sign)

    // 发起请求
    return axios.get(api.href)
        .then((res) => {
            if (res.data.error_code == 0) {
                return res.data.data.src
            } else {
                return null
            }

        })
        .catch((err) => {
            return null
        })
}

// 翻译
function translate(from, text, to) {
    // 生成sign
    var str1 = appid + text + salt + key;
    var sign = md5(str1)

    // 组成api
    let api = new url.URL("http://api.fanyi.baidu.com/api/trans/vip/translate")
    api.searchParams.append("q", text)
    api.searchParams.append("appid", appid)
    api.searchParams.append("salt", salt)
    api.searchParams.append("from", from)
    api.searchParams.append("to", to)
    api.searchParams.append("sign", sign)

    // 发起请求
    return axios.get(api.href)
        .then((res) => {
            if (res.status == 200) {
                // console.log(res);
                return res.data.trans_result[0].dst
            } else {
                return null
            }
        })
        .catch((err) => {
            return null
        })
}

export { checkLanguage, translate }