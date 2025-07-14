import express from "express";
import morgan from "morgan";
import cors from "cors";
import { corsOptions } from "../Config/Cors/Cors.config";
import { userRouter } from "../Infraestructure/HTTP/Routers/User.Router";
import { FirebaseAuthRouter } from "../Infraestructure/HTTP/Routers/FirebaseAuth.Router";
import { firebaseAuthController, firebaseAuthMiddleware } from "../Infraestructure/Dependencies";

const app = express();

app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de usuarios tradicionales
app.use("/api_user/usuarios", userRouter);

// Rutas de Firebase Authentication
const firebaseAuthRouter = new FirebaseAuthRouter(firebaseAuthController, firebaseAuthMiddleware);
app.use("/api_user/auth/firebase", firebaseAuthRouter.getRouter());
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

export { app };
