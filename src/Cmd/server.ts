import express from "express";
import morgan from "morgan";
import cors from "cors";
import { corsOptions } from "../Config/Cors/Cors.config";
import { userRouter } from "../Infraestructure/HTTP/Routers/User.Router";
import { firebaseAuthRouter } from "../Infraestructure/HTTP/Routers/FirebaseAuth.Router";

const app = express();

app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
app.use("/api_user/usuarios", userRouter);
app.use("/api_user/firebase", firebaseAuthRouter);

export { app };
