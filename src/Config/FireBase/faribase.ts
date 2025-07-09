import admin from "firebase-admin";
import googleServices from "../../../service_account.json";

admin.initializeApp({
  credential: admin.credential.cert(googleServices as admin.ServiceAccount),
});

export default admin;
