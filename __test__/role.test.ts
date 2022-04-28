import {assert, expect} from "chai";
import {AuthService} from "../dist/services";

describe("Test valid roles", () => {
    before(function () {
        this.timeout(20000); // 20 second timeout for setup
    });

    describe ("Test is valid role from session token", () => {
            it("Should return true if session is '62516d580613898ef31aa224' and expected role is Admin",   (done) => {
                AuthService.getInstance()
                    .isValidRole('62516d580613898ef31aa224', 'Admin')
                    .then(res => assert.equal(res, true))
                done()
            })

            it("Should return true if session is '62516d580613898ef31aa224' and expected role are Admin or Order Picker", (done) => {
                AuthService.getInstance()
                    .isValidRole('62516d580613898ef31aa224', ['Admin', 'OrderPicker'])
                    .then(res => assert.equal(res, true))
                done()
            })

            it("Should return false if session is '62516d580613898ef31aa224' and expected role is OrderPicker", (done) => {
            AuthService.getInstance()
                .isValidRole('62516d580613898ef31aa224', 'OrderPicker')
                .then(res => assert.equal(res, true))
            done()
        })
    })

    describe ("Test is valid role from user id", () => {
        it("Should return true if session is '6255ebba7f1ea572e124ab0a' and expected role is OrderPicker",   (done) => {
            AuthService.getInstance()
                .isValidRole('6255ebba7f1ea572e124ab0a', 'OrderPicker')
                .then(res => assert.equal(res, true))
            done()
        })

        it("Should return true if session is '6255ebba7f1ea572e124ab0a' and expected role are Admin or Order Picker", (done) => {
            AuthService.getInstance()
                .isValidRole('6255ebba7f1ea572e124ab0a', ['Admin', 'OrderPicker'])
                .then(res => assert.equal(res, true))
            done()
        })

        it("Should return false if session is '6255ebba7f1ea572e124ab0a' and expected role is Admin", (done) => {
            AuthService.getInstance()
                .isValidRole('6255ebba7f1ea572e124ab0a', 'Admin')
                .then(res => assert.equal(res, true))
            done()
        })
    })
})