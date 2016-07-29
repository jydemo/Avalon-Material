宜生活商家端项目

JS模块代码模板

```javascript
/**
 * Created by Y on 2016/7/18.
 */
define(['text!./login.html', 'avalon',], function (login) {
    avalon.templateCache.login = login;

    var actions = {
        login: 'login',
        password: 'password'
    };

    var model = avalon.define({
        $id: "login",
        // 模块
        control: '',
        // 页面
        action: 'add',
        // 参数
        params: '',
        // 视图VM
        content: 'empty',
        // 默认页面
        default: 'login'
    });

    model.$watch('action', function () {
        if (model.action in actions) {
            model.content = 'modules/' + model.control + '/' + model.action + '.html';
        } else {
            console.warn(model.action + ' 页面未找到，请假差！');
        }
    });

    return model;
});
```

ajax方法调用：

```javascript
avalon.vmodels.root.ajax();
```
参数和$.ajax()，一样