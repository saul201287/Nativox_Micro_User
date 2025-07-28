import express from "express";
import morgan from "morgan";
import cors from "cors";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { corsOptions } from "../Config/Cors/Cors.config";
import { userRouter } from "../Infraestructure/HTTP/Routers/User.Router";
import { firebaseAuthRouter } from "../Infraestructure/HTTP/Routers/FirebaseAuth.Router";

const app = express();

app.set("trust proxy", 3);

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    error:
      "Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos.",
    retryAfter: "15 minutos",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = req.ip || req.connection.remoteAddress || "unknown";
    return ipKeyGenerator(ip);
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error:
      "Demasiados intentos de autenticación, intenta de nuevo en 15 minutos.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    error:
      "Demasiadas solicitudes de recuperación de contraseña, intenta de nuevo en 1 hora.",
    retryAfter: "1 hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    error:
      "Límite de solicitudes excedido para esta acción, intenta de nuevo en 1 hora.",
    retryAfter: "1 hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(generalLimiter);

app.use("/api_user/usuarios/login", authLimiter);
app.use("/api_user/usuarios/registrar", authLimiter);
app.use("/api_user/firebase/login", authLimiter);
app.use("/api_user/firebase/registrar", authLimiter);

app.use("/api_user/usuarios/solicitar-recuperacion", passwordResetLimiter);
app.use("/api_user/usuarios/restablecer-contrasena", passwordResetLimiter);

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

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/api_user/rate-limit-info", (req, res) => {
  res.json({
    ip: req.ip,
    message: "Rate limit info endpoint",
    headers: {
      remaining: res.get("RateLimit-Remaining"),
      limit: res.get("RateLimit-Limit"),
      reset: res.get("RateLimit-Reset"),
    },
  });
});

export { app };
