import TelegramBot from 'node-telegram-bot-api';
import { tg_bot } from './functions/token/index.js';
import { getLocationInfo, getWeatherInfo } from './functions/weather/index.js';
import { chat } from './functions/chat/index.js'
import { lang } from './functions/translate/language.js'
import { checkLanguage, translate } from './functions/translate/index.js'
import { noteWrite, noteRead } from './functions/note/index.js'

// 实例化机器人
const bot = new TelegramBot(tg_bot.token, {
    polling: true, // 轮询，间隔向tg服务器拉取消息
    baseApiUrl: tg_bot.baseApiUrl
})

// 新用户进入
bot.onText(/\/start/, async(msg) => {
    bot.sendMessage(msg.from.id, "小K秘书命令：\n1.查询天气(/weather city)\n2.翻译(/translate text)")
});

// 自动聊天机器人
// bot.onText(/[\s\S]*/, async(msg) => {
//     // 获取回复
//     if (msg.text) {
//         let reply = await chat(msg.text)
//         bot.sendMessage(msg.from.id, reply)
//     }
// })

// 天气查询
bot.onText(/\/weather (.+)/, async(msg, match) => {
    // 获取输入的城市
    let city = match[1]

    // 获取城市
    let location = await getLocationInfo(city)

    if (location == null) {
        bot.sendMessage(msg.from.id, "输入城市错误，或你查询的地区暂时没有你需要的数据，请稍后再试！")
    } else if (location.length == 1) {
        // 获取城市天气信息
        let data = await getWeatherInfo(location[0].id)
        bot.sendPhoto(msg.from.id, 'https://icons.qweather.com/assets/images/qweather-icons-hero.png', {
            caption: "城市：" + city +
                "\n气温：" + data.now.temp +
                "°C\n体感：" + data.now.feelsLike +
                "°C\n气象：" + data.now.text +
                "\n风向：" + data.now.windDir +
                "\n风力等级：" + data.now.windScale +
                "\n风速：" + data.now.windSpeed +
                "公里/小时\n相对湿度：" + data.now.humidity + "%" +
                "\n小时累计降水量：" + data.now.precip +
                "毫米\n大气压强：" + data.now.pressure +
                "百帕\n能见度：" + data.now.vis +
                "公里\n数据观测时间：" + data.now.obsTime
        })
    } else {
        // 用户输入的是市级或以上(有多个返回数据)
        // 把搜索的城市分组
        let access = true // 输入是否有效开关
        let button = [] // 全部按键
        let row = [] // 一行的按键
        for (let i = 0; i < location.length; i++) {
            let item = location[i]

            // 用户输入省份：阻止查询
            if ((city.search("省") == 0) || (city + "省" == item.adm1)) {
                bot.sendMessage(msg.from.id, "请输入市级或以下的城市")
                access = false
                break
            }

            // 不显示市级的天气
            if (item.name == item.adm2) {
                continue
            }

            // 一行的数据
            row.push({
                text: item.adm2 + "市" == item.adm1 ? item.adm1 + item.name : (item.name == item.adm2 ? item.adm1 + item.name : item.adm1 + item.adm2 + item.name),
                callback_data: "weather_" + item.name + "_" + item.id
            })
            button.push(row)
            row = []
        }
        // console.log(button);
        if (access) {
            bot.sendMessage(msg.from.id, "请选择你搜索的城市：", {
                reply_markup: {
                    inline_keyboard: button
                }
            })
        }
    }
})

// 翻译文本
bot.onText(/\/translate (.+)/, async(msg, match) => {
    // 获取要翻译的文本
    let text = match[1]

    // 语言识别
    var language = await checkLanguage(text)

    // 写入callback_data
    let button = []
    for (let i = 0; i < lang.length; i++) {
        let item = lang[i][0];
        let callback = item.callback_data + "_" + language + "_" + text
        button.push([{
            text: item.text,
            callback_data: callback
        }])
    }

    // 询问翻译哪种语言
    bot.sendMessage(msg.from.id, "请选择翻译目标语言：", {
        reply_markup: {
            inline_keyboard: button
        }
    })
})

// 监听用户按键返回值
bot.on('callback_query', async(msg) => {
    var command = msg.data.split("_")[0]
    var value = msg.data.split("_")[1]

    // console.log(command, value);

    // 天气位置选择操作
    if (command == "weather") {
        // 获取城市id
        let locationID = msg.data.split("_")[2]

        // 获取城市天气信息
        let data = await getWeatherInfo(locationID)
        bot.sendPhoto(msg.from.id, 'https://icons.qweather.com/assets/images/qweather-icons-hero.png', {
            caption: "城市：" + value +
                "\n气温：" + data.now.temp +
                "°C\n体感：" + data.now.feelsLike +
                "°C\n气象：" + data.now.text +
                "\n风向：" + data.now.windDir +
                "\n风力等级：" + data.now.windScale +
                "\n风速：" + data.now.windSpeed +
                "公里/小时\n相对湿度：" + data.now.humidity + "%" +
                "\n小时累计降水量：" + data.now.precip +
                "毫米\n大气压强：" + data.now.pressure +
                "百帕\n能见度：" + data.now.vis +
                "公里\n数据观测时间：" + data.now.obsTime
        })
    }

    // 翻译目标语言操作
    if (command == "translate") {
        // 获取目标语言
        let target = msg.data.split("_")[2]

        // 获取需翻译文本
        let text = msg.data.split("_")[3]

        // 进行翻译
        let dst = await translate(target, text, value)

        // 向用户返回翻译好的文本
        bot.sendMessage(msg.from.id, dst)
    }
})