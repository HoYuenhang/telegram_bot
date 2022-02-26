import axios from "axios"
import url from "url"
import { HeFeng_key } from "../token/index.js"

// 请求地理位置信息
function getLocationInfo(location) {
    // 组成请求url
    const api = new url.URL("https://geoapi.qweather.com/v2/city/lookup")
    api.searchParams.append("key", HeFeng_key)
    api.searchParams.append("location", location)
    api.searchParams.append("number", 20)

    // 发起请求
    return axios.get(api.href)
        .then((res) => {
            if (res.data.code == 200) {
                // console.log(res.data.location)
                return res.data.location
            } else {
                return null
            }
        })
        .catch((err) => {
            return null
        })
}

// 请求天气信息
function getWeatherInfo(locationID) {
    // 组成请求url
    const api = new url.URL("https://devapi.qweather.com/v7/weather/now")
    api.searchParams.append("key", HeFeng_key)
    api.searchParams.append("location", locationID)
        // api.searchParams.append("lang", "ja")

    // 发起请求
    return axios.get(api.href)
        .then((res) => {
            if (res.data.code == 200) {
                // console.log(res)
                return res.data
            }
        })
        .catch((err) => {
            return {
                code: 404,
                error: err
            }
        })
}

export { getLocationInfo, getWeatherInfo }