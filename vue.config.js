"use strict";
const path = require("path");
const defaultSettings = require("./src/config/index.js");
const BundleAnalyzerPlugin =
    require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

function resolve(dir) {
  return path.join(__dirname, dir);
}

const name = defaultSettings.title || "testDemo";
// 生产环境，测试和正式
const IS_PROD = ["production", "prod"].includes(process.env.NODE_ENV);

const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  // publicPath: './', // 署应用包时的基本 URL。 vue-router hash 模式使用
  //署应用包时的基本 URL。  vue-router history模式使用
  publicPath: "/",
  //  生产环境构建文件的目录
  outputDir: "dist",
  //  outputDir的静态资源(js、css、img、fonts)目录
  assetsDir: "static",
  //保存是否校验eslint
  lintOnSave: !IS_PROD,
  // js调试源码映射地图，如果你不需要生产环境的 source map，可以将其设置为 false,即打包时不会生成 .map 文件,以加速生产环境构建。
  productionSourceMap: false,
  // 默认情况下 babel-loader 会忽略所有 node_modules 中的文件。你可以启用本选项，以避免构建后的代码中出现未转译的第三方依赖。
  transpileDependencies: false,
  devServer: {
    port: defaultSettings.port, // 端口
    open: false, // 启动后打开浏览器
    client: {
      overlay: {
        //当出现编译器错误或警告时，在浏览器中显示全屏覆盖层
        //设置错误在页面弹出、警告不在页面弹出
        warnings: false,
        errors: true,
      },
    },
    //proxy代理
    /**
     * 代理定义
     * 正向代理：替客户端向服务器发送请求，可以解决跨域问题
     * 反向代理：替服务器统一接收请求。
     */
    proxy: {
      //配置跨域
      "/api": {
        target: defaultSettings.baseApi,
        // ws:true,
        changOrigin: true,
        pathRewrite: {
          "^/api": "",
        },
      },
    },
  },

  configureWebpack: (config) => {
    config.name = name;

    // 为生产环境修改配置...
    /**
     * 依赖模块采用第三方cdn资源
     * externals: {
     * '包名' : '在项目中引入的名字'
     *         'vue': 'Vue',
     *         'vuex': 'Vuex',
     *         'vue-router': 'VueRouter',
     *         'element-ui': 'ELEMENT'
     *     }
     */
    // if (IS_PROD) {
    //   // externals
    //   config.externals = externals
    // }

    // 取消webpack警告的性能提示
    config.performance = {
      hints: "warning",
      //入口起点的最大体积
      maxEntrypointSize: 50000000,
      //生成文件的最大体积
      maxAssetSize: 30000000,
      //只给出 js 文件的性能提示
      assetFilter: function (assetFilename) {
        return assetFilename.endsWith(".js");
      },
    };
  },

  css: {
    extract: IS_PROD, // 是否将组件中的 CSS 提取至一个独立的 CSS 文件中 (而不是动态注入到 JavaScript 中的 inline 代码)。
    sourceMap: false,
    loaderOptions: {
      //专门用来全局颜色、变量、mixin，千万不要引入全局样式，要不然每个页面都会重复引用
      scss: {
        // 向全局sass样式传入共享的全局变量, $src可以配置图片cdn前缀
        // 详情: https://cli.vuejs.org/guide/css.html#passing-options-to-pre-processor-loaders
        // $cdn: "${defaultSettings.$cdn}";
        additionalData: `
          @import "@/assets/styles/variables.scss"; //项目存放scss变量地址
          `
      }
    }
  },

  chainWebpack: (config) => {
    // 目录别名 alias
    config.resolve.alias.set("@", resolve("src"));
    // .set("assets", resolve("src/assets"))
    // .set("api", resolve("src/api"))
    // .set("views", resolve("src/views"))
    // .set("components", resolve("src/components"));

    /**
     * cdn = {
     *     css: [
     *       'https://unpkg.com/element-ui/lib/theme-chalk/index.css' // element-ui css 样式表
     *     ],
     *     js: [
     *       // vue must at first!
     *       'https://unpkg.com/vue@2.6.12/dist/vue.js', // vuejs
     *       'https://unpkg.com/element-ui/lib/index.js', // element-ui js
     *       'https://cdn.jsdelivr.net/npm/xlsx@0.16.6/dist/xlsx.full.min.js', // xlsx
     *     ]
     *     }
     * 原文链接：https://blog.csdn.net/Wy_so_serious/article/details/121044173
     */
    // config.plugin('html').tap(args => {
    //   if (IS_PROD) {
    //     args[0].cdn = cdn.build
    //   } else {
    //     args[0].cdn = cdn.dev
    //   }
    //   return args
    //  })
    // const oneOfsMap = config.module.rule("scss").oneOfs.store;
    // oneOfsMap.forEach(item => {
    //   item
    //     .use("style-resources-loader")
    //     .loader("style-resources-loader")
    //     .options({
    //       // 这里的路径不能使用 @ 符号，否则会报错
    //       // patterns: ["./src/assets/reset1.less", "./src/assets/reset2.less"]
    //       patterns: "./src/assets/styles/variables.scss"
    //     })
    //     .end()
    // })
    /**
     * 设置保留空格
     */
    config.module
        .rule("vue")
        .use("vue-loader")
        .loader("vue-loader")
        .tap((options) => {
          options.compilerOptions.preserveWhitespace = true;
          return options;
        })
        .end();

    // config.module.rule('images')
    //   .use('url-loader')
    //   .tap(options => ({
    //     //[hash:10]取图片的hash的前10位
    //     //[ext]取文件原来扩展名
    //     name: './assets/images/[name].[ext]',
    //     quality: 85,
    //     limit: 8 * 1024, //
    //     // encoding: true, // 默认为true, 是否使用默认编码base64，可以["utf8","utf16le","latin1","base64","hex","ascii","binary","ucs2"]
    //     // generator: '', // 类型:{Function},默认值:() => type/subtype;encoding,base64_data,可以自定义数据编码。
    //     esModule: false, // 关掉es6模块化解析
    //     // fallback: 'file-loader',  //指定当目标文件的大小超过限制时要使用的备用加载程序
    //   }));
    config.module.rule("images").set("parser", {
      dataUrlCondition: {
        maxSize: 8 * 1024, // 小于8K的图片将直接以base64的形式内联在代码中，可以减少一次http请求。
      },
    });

    // svg-sprite-loader 将svg图片以雪碧图的方式在项目中加载
    config.module.rule("svg").exclude.add(resolve("src/assets/icons")).end();
    config.module
        .rule("icons")
        .test(/\.svg$/) //添加匹配规则
        .include.add(resolve("src/assets/icons")) //添加我们要处理的文件路径 svg图片地址
        .end() //上面的add方法改变了上下文，调用end()退回到include这一级
        .use("svg-sprite-loader") //使用"svg-sprite-loader"这个依赖
        .loader("svg-sprite-loader") //选中这个依赖
        .options({
          // 这个配置是这个包的配置不属于webpack，可以查看相关文档，symbolId指定我们使用svg图片的名字
          symbolId: "icon-[name]",  // 使用图标的方式 icon-文件名
        }) //传入配置
        .end();
    /**
     * 打包分析
     * https://blog.csdn.net/formylovetm/article/details/126424858
     */
    if (IS_PROD) {
      config.plugin("webpack-report").use(BundleAnalyzerPlugin, [
        {
          analyzerMode: "static",
        },
      ]);
    }
    /**
     * 是否开启源码映射调试
     * https://www.cnblogs.com/suwanbin/p/16901247.html
     * 浏览器上调试代码的问题,但是代码在显示的时候会出现压缩编码等问题,代码和原来就不一样,这时候需要打开调试模式.
     * source-map: 在外部生成一个文件,在控制台会显示 错误代码准确信息 和 源代码的错误位置
     * inline-source-map: 内嵌到bundle.js中, 只生成一个source-map,在控制台会显示 错误代码准确信息 和 源代码的错误位置
     * hidden-source-map: 外部,错误代码错误原因，源代码的错误位置,不能追踪源代码错误，只能提示到构建后代码的错误位置
     * eval-source-map： 内嵌,每一个文件都生成对应的source-map,在控制台会显示 错误代码准确信息，源代码的错误位置
     * nosources-source-map: 外部,错误代码准确信息，没有任何源代码信息
     * cheap-source-map: 外部,错误代码准确信息，源代码的错误位置,只能精准到行
     * cheap-module-source-map: 外部,错误代码准确信息，源代码的错误位置,module会将loader的source-map加入
     *
     * 内嵌与外部的区别： 1.外部生成单独的文件，内嵌没有 2.内嵌构建速度快
     * 这么多source-map如何选择？
     * 开发环境：速度快，调试更友好
     * 速度快（ eval>inline>cheap>··· ）
     * 组合eval-cheap-source-map > eval-source-map,调试更友好
     * source-map > cheap-module-source-map > cheap-source-map
     * 最终结果：cheap-module-source-map 和 eval-source-map (vuecli与react脚手架默认)
     *生产环境：源代码要不要隐藏？调试要不要更友好
     *内嵌会让代码体积变大，所以在生产环境下不用内嵌
     *  nosources-source-map全部隐藏
     * hidden-source-map 只隐藏源代码，会提示构建后代码错误信息
     * 最终结果：source-map 和 cheap-module-source-map
     */
    config
        // https://webpack.js.org/configuration/devtool/#development
        .when(!IS_PROD, (config) => config.devtool("cheap-module-source-map"));

    config.when(IS_PROD, (config) => {
      /**
       * Vue预渲染prerender-spa-plugin+vue-meta-info
       * https://blog.csdn.net/milkgan/article/details/127509160
       * 只有少量页面需要SEO优化
       * 仅仅提高首屏的渲染速度，且首屏的几乎只有静态数据的情况
       * preload 预加载,提前预加载提高切换路由的体验,加上这个，会打包报错
       * Vue CLI 4.5 和更早版本会使用 Preload 技术
       */
      // config.plugin("preload").tap(() => [
      //   {
      //     rel: "preload",
      //     // to ignore runtime.js 注：这里要把 runtime 代码的 preload 去掉。
      //     fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
      //     include: "initial"
      //   }
      // ]);
      /**
       * https://blog.csdn.net/qq_36278221/article/details/128042470
       * 多页面打包配置
       * Object.keys(pages).forEach((element) => {
       *         config.plugin('preload-' + element).tap(() => [
       *           {
       *             rel: 'preload',
       *             // to ignore runtime.js
       *             fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
       *             include: 'initial',
       *           },
       *         ])
       *         config
       *           .plugin("ScriptExtHtmlWebpackPlugin")
       *           .after('html-' + element)
       *           .use('script-ext-html-webpack-plugin', [
       *             {
       *               // `runtime` must same as runtimeChunk name. default is `runtime`
       *               inline: /runtime\..*\.js$/,
       *             },
       *           ])
       *           .end()
       *         config.plugins.delete('prefetch-' + element)
       *       })
       * runtime.js 处理策略
       * 根据路由驱动页面的 runtime 代码默认情况是包含在 build 后的 app.hash.js 内的，如果我们改动其他路由，就会导致 runtime 代码改变。从而不光我们改动的路由对应的页面 js 会变，含 runtime 代码的 app.hash.js 也会变，对用户体验是非常不友好的。
       * 为了解决这个问题要设定 runtime 代码单独抽取打包：
       *  config.optimization.runtimeChunk('single')
       * 但是 runtime 代码由于只是驱动不同路由页面的关系，代码量比较少，请求 js 的时间都大于执行时间了，
       * 所以使用 script-ext-html-webpack-plugin 插件将其内链在 index.html 中比较友好。
       */
      config
          .plugin("ScriptExtHtmlWebpackPlugin")
          .after("html")
          .use("script-ext-html-webpack-plugin", [
            {
              // 将 runtime 作为内联引入不单独存在
              inline: /runtime\..*\.js$/,
            },
          ])
          .end();
      //当有很多页面时，会导致太多无意义的请求
      config.plugins.delete("prefetch");

      /**
       * https://blog.csdn.net/weixin_44786530/article/details/126936033
       * 去掉代码中的console和debugger和注释
       */
      config.optimization.minimizer("terser").tap((options) => {
        options[0].terserOptions.compress.warnings = false;
        options[0].terserOptions.compress.drop_console = true;
        options[0].terserOptions.compress.drop_debugger = true;
        options[0].terserOptions.compress.pure_funcs = ["console.log"];
        options[0].terserOptions.output = {
          //删除注释
          comments: false,
        };
        return options;
      });

      /**
       * chunks 资源分块
       * 如果使用了某些长期不会改变的库，像 element-ui ，打包完成有 600 多 KB ，
       * 包含在默认 vendor 中显然不合适，每次用户都要加载这么大的文件体验不好，所以要单独打包
       */
      config.optimization.splitChunks({
        chunks: "all",
        cacheGroups: {
          // cacheGroups 下可以可以配置多个组，每个组根据test设置条件，符合test条件的模块
          commons: {
            name: "chunk-commons",
            test: resolve("src/components"),
            minChunks: 3, //  被至少用三次以上打包分离
            priority: 5, // 优先级
            reuseExistingChunk: true, // 表示是否使用已有的 chunk，如果为 true 则表示如果当前的 chunk 包含的模块已经被抽取出去了，那么将不会重新生成新的。
          },
          node_vendors: {
            name: "chunk-libs",
            chunks: "initial", // 只打包初始时依赖的第三方
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
          },
          vantUI: {
            name: "chunk-elementUI", // 单独将 vantUI 拆包
            priority: 20, // 数字大权重到，满足多个 cacheGroups 的条件时候分到权重高的
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/,
          },
        },
      });
      config.optimization.runtimeChunk("single"),
          {
            from: path.resolve(__dirname, "./public/robots.txt"), //防爬虫文件
            to: "./", //到根目录下
          };
    });
  },

  pluginOptions: {
    "style-resources-loader": {
      preProcessor: "sass",
      patterns: [],
    },
  },
});
