class YPromise {
    constructor(handler) {
        this.status = "pending";
        this.value;
        this.reason;

        let resolve = (value) => {
            if (this.status === "pending") {
                this.status = "resolved";
                this.value = value;
            }
        }

        let reject = (err) => {
            if (this.status === "pending") {
                this.status = "rejected";
                this.reason = err;
            }
        }

        try {
            handler(resolve, reject);
        } catch (err) {
            reject(err);
        }
    }
    then(callback, fallback) {
        if (this.status === "resolved") {
            callback(this.value);
        } else {
            fallback(this.reason);
        }
    }
}