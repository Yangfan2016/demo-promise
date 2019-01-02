let YPromise = require('./YPromise.js');


new YPromise(function (resolve, reject) {
    resolve(1);
}).then(function (data) {
    console.log(data);
    return YPromise.resolve(2);
}).then(function (data) {
    console.log(data);
    return new YPromise(function (resolve) {
        setTimeout(function () {
            resolve(3)
        }, 0);
    });
}).then(function (data) {
    console.log(data);
    return 4;
}).then(function (data) {
    console.log(data);
});