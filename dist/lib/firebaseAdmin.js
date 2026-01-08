"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseAdmin = void 0;
exports.firebaseInitialized = firebaseInitialized;
exports.initFirebaseAdmin = initFirebaseAdmin;
exports.firebaseAdmin = null;
let _firebaseInitialized = false;
function firebaseInitialized() {
    return _firebaseInitialized;
}
function initFirebaseAdmin() {
    // minimal stub: no-op
    _firebaseInitialized = false;
}
exports.default = {
    initFirebaseAdmin,
    firebaseInitialized
};
