export let firebaseAdmin: any = null;
let _firebaseInitialized = false;
export function firebaseInitialized() {
  return _firebaseInitialized;
}

export function initFirebaseAdmin() {
  // minimal stub: no-op
  _firebaseInitialized = false;
}

export default {
  initFirebaseAdmin,
  firebaseInitialized
};