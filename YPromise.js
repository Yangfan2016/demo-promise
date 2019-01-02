// helpers
function _isFunc(obj) {
    return typeof obj === "function";
}

class YPromise {
    constructor(handler) {
        this.status = "pending";
        this.value;
        this.reason;
        this.succHandlerList = []; // for async
        this.errHandlerList = []; // for async

        let resolve = (value) => {
            if (this.status === "pending") {
                this.status = "resolved";
                this.value = value;
                this.succHandlerList.forEach(fn => {
                    fn(value);
                });
            }
        }

        let reject = (err) => {
            if (this.status === "pending") {
                this.status = "rejected";
                this.reason = err;
                this.errHandlerList.forEach(fn => {
                    fn(err);
                });
            }
        }

        try {
            handler(resolve, reject);
        } catch (err) {
            reject(err);
        }
    }
    then(callback, fallback) {
        callback = _isFunc(callback) ? callback : value => value;
        fallback = _isFunc(fallback) ? fallback : err => { throw err; }
        let promise;
        switch (this.status) {
            case 'pending': // for async
                promise = new YPromise((resolve, reject) => {
                    this.succHandlerList.push(() => {
                        // to be async https://promisesaplus.com/#point-67
                        setTimeout(() => {
                            try {
                                let returnVal = callback(this.value);
                                YPromise.resolvePromise(promise, returnVal, resolve, reject);
                            } catch (err) {
                                reject(err);
                            }
                        }, 0);
                    });
                    this.errHandlerList.push(() => {
                        setTimeout(() => {
                            try {
                                let returnVal = fallback(this.reason);
                                YPromise.resolvePromise(promise, returnVal, resolve, reject);
                            } catch (err) {
                                reject(err);
                            }
                        }, 0);
                    });
                });
                break;
            case 'resolved':
                promise = new YPromise((resolve, reject) => {
                    setTimeout(() => {
                        try {
                            let returnVal = callback(this.value);
                            YPromise.resolvePromise(promise, returnVal, resolve, reject);
                        } catch (err) {
                            reject(err);
                        }
                    }, 0);
                });
                break;
            case 'rejected':
                promise = new YPromise((resolve, reject) => {
                    setTimeout(() => {
                        try {
                            let returnVal = fallback(this.reason);
                            YPromise.resolvePromise(promise, returnVal, resolve, reject);
                        } catch (err) {
                            reject(err);
                        }
                    }, 0);
                });
                break;
            default:
                // nothing
                break;
        }

        return promise;
    }
    static resolvePromise(promise, x, resolve, reject) {
        if (x instanceof YPromise) {
            if (x.status === "pending") {
                x.then(data => {
                    YPromise.resolvePromise(promise, data, resolve, reject);
                }, err => {
                    reject(err);
                });
            } else {
                x.then(resolve, reject);
            }
        } else { // noraml value
            resolve(x);
        }
    }
    static resolve(value) {
        return new YPromise(function (resolve) {
            resolve(value);
        });
    }
    static reject(err) {
        return new YPromise(function (resolve, reject) {
            reject(value);
        });
    }
}

module.exports = YPromise;