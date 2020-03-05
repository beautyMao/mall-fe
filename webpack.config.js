/*
 * @Author: Pan Jiahui
 * @Date:   2018-09-04 20:39:31
 * @Last Modified by:   Pan Jiahui
 * @Last Modified time: 2018-09-19 18:50:06
 */

const path = require('path');
const webpack = require('webpack')
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const CleanWebpackPlugin = require('clean-webpack-plugin') //删除指定文件 
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const glob = require('glob');

// 环境变量配置，dev / online 
const WEBPACK_ENV = process.env.WEBPACK_ENV || 'dev';

//获取html-webpack-plugin参数的方法
let getHtmlConfig = function(name, title) {
    return {
        hash: true, //向html引入的src链接后面增加一段hash值,消除缓存
        inject: true,
        template: './src/view/' + name + '.html', //模板地址
        minify: {
            collapseWhitespace: true, //折叠空白区域 也就是压缩代码
            removeAttributeQuotes: true, //压缩 去掉引号
        },
        filename: 'view/' + name + '.html', //每次调用指定生成的html名称
        chunks: ['common', name], //添加引入的js,也就是entry中的key
        title: title,
    };
}



module.exports = {
    /* * 【新增】：新增mode参数，webpack4中要指定模式，可以放在配置文件这里，也可以放在启动命令里，如--mode production */
    mode: 'dev' === WEBPACK_ENV ? 'development' : 'production',
    entry: {
        index: ['./src/page/index/index.js'],
        login: ['./src/page/login/index.js'],
        common: ['./src/page/common/index.js'],
    },
    output: {
        /* * 【改动】：删除path的配置，在webpack4中文件默认生成的位置就是/dist,
         * 而publicPath和filename特性的设置要保留 */
        //  path: path.resolve(__dirname, 'dist'),
        //   publicPath: '/dist/', //这里要放的是静态资源CDN的地址
        //   filename: 'js/[name].js',
        publicPath: 'dev' === WEBPACK_ENV ? '/dist/' : '//s.happymmall.com/mmall-fe/dist/',
        filename: 'js/[name].js'
    },
    resolve: {
        //配置别名可以加快webpack查找模块的速度
        alias: {
            node_modules: __dirname + '/node_modules',
            util: __dirname + '/src/util',
            page: __dirname + '/src/page',
            service: __dirname + '/src/service',
            image: __dirname + '/src/image'
        }
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    name: "common",
                    chunks: "initial",
                    minChunks: 2
                }
            }
        }
    },
    module: {
        rules: [{
            test: /\.(sa|sc|c)ss$/,
            exclude: /node_modules/,
            include: path.join(__dirname, 'src'), //限制范围，提高打包速度
            use: [
                MiniCssExtractPlugin.loader,
                "css-loader",
                "postcss-loader",
                "sass-loader",
            ]
        }, {
            //file-loader 解决css等文件中引入图片路径的问题
            // url-loader 当图片较小的时候会把图片BASE64编码，大于limit参数的时候还是使用file-loader 进行拷贝
            test: /\.(gif|png|jpg|woff|svg|eot|ttf)\??.*$/,
            include: path.join(__dirname, 'src'), //限制范围，提高打包速度
            exclude: /node_modules/,
            use: 'url-loader?limit=100&name=images/[hash:8].[name].[ext]'
        }, {
            test: /\.string$/,
            include: path.join(__dirname, 'src'), //限制范围，提高打包速度
            exclude: /node_modules/,
            use: 'html-loader'
        }, ]
    },


    plugins: [
        new CleanWebpackPlugin(['dist']), //传入数组,指定要删除的目录
        //提取css代码
        new MiniCssExtractPlugin({
            filename: 'css/app.[name].css',
            chunkFilename: 'css/app.[contenthash:12].css' // use contenthash *
        }),
        new HtmlWebpackPlugin(getHtmlConfig('index', '首页')),
        new HtmlWebpackPlugin(getHtmlConfig('login', '登录')),

        new webpack.ProvidePlugin({
            _: 'lodash' //所有页面都会引入 _ 这个变量，不用再import引入
        }),

        //new webpack.HotModuleReplacementPlugin(),
        // 提供公共代码
        // 默认会把所有入口节点的公共代码提取出来,生成一个common.js webpack4删除此配置
        // new webpack.optimize.CommonsChunkPlugin({
        //      name:'commons',filename:'js/base.js'
        // }}),
    ],
    devServer: {
        contentBase: path.join(__dirname, "dist"), //静态文件根目录
        //clientLogLevel: 'warning',
        //  overlay: true,
        // hot: true,
        // compress: true,
        host: 'localhost',
        // inline: true,
        port: 8088,
        // compress: false, // 服务器返回浏览器的时候是否启动gzip压缩
        // overlay: {
        //     warnings: false,
        //     errors: true
        // },
        // watch: true,
        // watchOptions: {
        //     ignored: /node_modules/, //忽略不用监听变更的目录
        //     aggregateTimeout: 500, //防止重复保存频繁重新编译,500毫米内重复保存不打包
        //     poll: 1000 //每秒询问的文件变更的次数
        // }
    }

};