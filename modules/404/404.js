/**
 * Created by anoxia on 16-7-21.
 */
define(['text!./404.html', 'avalon',], function (error) {
    avalon.templateCache.error = error;

    var model = avalon.define({
        $id: "404"
    });
});