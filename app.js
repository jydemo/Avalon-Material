/**
 * Created by Y on 2016/7/13.
 */
require.config({
    baseUrl: '',
    paths: {
        domReady: 'vendor/require/domReady',
        text: 'vendor/require/text',
        css: 'vendor/require/css',
        avalon: 'vendor/avalon/avalon.shim.min',
        mmRouter: 'vendor/avalon/mmRouter',
        mmHistory: 'vendor/avalon/mmHistory'
    },
    shim: {
        mmHistory: {
            deps: ['avalon']
        },
        mmRouter: {
            deps: ['avalon']
        },
        mmRequest: {
            deps: ['avalon']
        }
    }
});

// 加载初始化
require(['domReady!', 'mmRouter', 'mmHistory'], function () {

    // 项目配置
    var app_config = {
        // 基础网址
        base_url: 'http://192.168.1.200/',
        // 接口地址
        api_url: '/api.php/',
        // 当前模块
        control: '',
        // 视图VM
        action: '',
        // 参数
        params: '',
        // 项目模块
        modules: {
            login: 'login',
            register: 'register'
        },
        // 默认入口模块
        module_default_out: 'login',
        // 应用默认模块
        module_default_in: 'dash',
        // 不存在模块
        module_error: '404',
        // ajax请求超时时间
        timeout: 10000,
        // 模块目录名
        folder: 'modules'
    };

    avalon.templateCache.empty = '';
    var model = avalon.define({
        $id: 'root',
        page: 'empty',
        // 是否登录
        is_login: false,
        // URL解析
        dispatch: function () {
            // 过滤URL敏感字符
            for (var param in this.params) {
                this.params[param] = this.params[param].replace(/[^a-zA-Z0-9-_]+/g, '');
            }

            // 登录状态检查
            if (model.is_login == true) {
                // 模块控制器
                if (this.params.control == undefined || this.params.control == '') {
                    app_config.control  = app_config.module_default_in;
                } else {
                    app_config.control  = this.params.control;
                }

                // 方法
                if (this.params.action == undefined) {
                    app_config.action   = '';
                } else {
                    app_config.action   = this.params.action;
                }

                // 参数
                if (this.params.param != undefined) {
                    app_config.param    = this.params.param;
                }
            } else {
                app_config.action   = '';
                app_config.params   = '';

                // 模块
                if (this.params.control != undefined && this.params.control === 'register') {
                    app_config.control  = 'register';
                    if (this.params.action != undefined) {
                        app_config.action   = this.params.action;
                    }
                } else {
                    app_config.control  = app_config.module_default_out;
                }

                // 页面
                if (this.params.action != undefined) {
                    app_config.action   = this.params.action;
                }
            }
            // 加载模块
            model.load();
        },
        // 模块加载
        load: function () {
            if (app_config.control in app_config.modules) {
                var module_dir = app_config.folder + '/' + app_config.control + '/' + app_config.control;

                require([module_dir], function (module) {
                    // 检查模块返回的对象
                    try {
                        if (module.default == undefined) {}
                    } catch (e) {
                        console.warn('模块对象未返回，请使用 return model; 返回模块对象。');
                    }

                    // 模块间传值
                    module.control  = app_config.control;

                    // 检查默认页面值
                    if (module.default == undefined) {
                        console.warn(module_dir + '.js 默认页面[default]未定义，请检查');
                    }
                    if (module.default == '') {
                        console.warn(module_dir + '默认页面未设置，请检查[default]值！');
                    }

                    // 自动加载模块默认页面
                    if (app_config.action == '') {
                        module.action   = module.default;
                    } else {
                        module.action   = app_config.action;
                    }

                    module.params   = app_config.param;

                    // 切换当前页面控制器
                    model.page = app_config.control;
                });
            } else {
                // 模块不存在 - 404
                require([app_config.folder + '/' + app_config.module_error + '/' + app_config.module_error], function () {
                    model.page = 'error';

                    // model.page = '404';
                    console.warn('模块未找到');
                });
            }
        },
        ajax: function (config) {
            // 请求类型检查
            // TYPE
            var _type   = '';
            if (config.type == undefined || config.type == '') {
                _type   = 'GET';
            } else {
                _type   = config.type.toUpperCase()
            }

            // URL
            var _url    = '';
            if (config.url == undefined || config.url == '') {
                console.warn('Ajax 地址参数未设置');
            } else {
                _url    = config.url;
            }

            // CACHE
            var _cache  = '';
            if (config.cache == undefined) {
                _cache  = false;
            } else if (typeof config.cache != "boolean") {
                console.warn('Ajax cache 值格式必须为boolean！');
            } else {
                _cache  = config.cache;
            }

            // data
            var _data = {};
            if (config.data != undefined) {
                _data = config.data;
            } else {
                _data = {__: ''};
            }

            // 请求超时时间
            var _timeout = app_config.timeout;
            if (config.timeout == undefined) {
                _timeout = app_config.timeout;
            } else if (config.timeout < 1000) {
                console.warn('接口超时时间不能低于1s，此参数以毫秒计时，请留意！');
            } else {
                _timeout = parseInt(config.timeout);
            }

            if (_type === 'GET' || _type === 'POST') {
                $.ajax({
                    url: app_config.api_url + _url,
                    type: _type,
                    cache: _cache,
                    data: _data,
                    timeout: _timeout,
                    beforeSend: function () {
                        if (typeof config.beforeSend === 'function') {
                            config.beforeSend();
                        }
                    },
                    success: function(data) {
                        if (typeof config.success === 'function') {
                            config.success(data);
                        }
                    },
                    error: function() {
                        if (typeof config.error === 'function') {
                            config.error();
                        }
                        // alert(typeof config.error);
                    }
                });
            }
            return false;
        }
    });
    avalon.scan(document.body);

    // 监听登录状态
    model.$watch('is_login', function () {
        model.dispatch();
    });

    avalon.router.get("/", model.dispatch);
    avalon.router.get("/:control", model.dispatch);
    avalon.router.get("/:control/:action", model.dispatch);
    avalon.router.get("/:control/:action/*param", model.dispatch);
    //历史记录堆栈管理
    avalon.history.start();
});