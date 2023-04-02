/**
 * 以 VUE_APP_ 开头的变量，在代码中可以通过 process.env.VUE_APP_ 访问。
 * 比如,VUE_APP_ENV = 'development' 通过process.env.VUE_APP_ENV 访问。
 * 除了 VUE_APP_* 变量之外，在你的应用代码中始终可用的还有两个特殊的变量NODE_ENV 和BASE_URL
 */
// 根据环境引入不同配置 process.env.VUE_APP_ENV
const environment = process.env.VUE_APP_ENV || "production";
const config = require("./env." + environment);
module.exports = config;