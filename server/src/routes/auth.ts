import express from "express";
import jwt from "jsonwebtoken";
import { UserModel, UserType } from "../schemas/user";
import { respond } from "../utils/response";
import { Types } from "mongoose";
import "../auth/auth";
import passport from "passport";

const authRouter = express.Router();

authRouter.post(
  "/login",
  passport.authenticate("login", { session: false }),
  async (req, res, next) => {
    const { user } = req;

    if (!user) {
      return respond({
        res,
        error: "User not passed from passport middleware",
      });
    }

    req.login(user, { session: false }, (error) => {
      if (error) return next(error);

      const { _id, email } = user as UserType;
      const jwtToken = jwt.sign({ userId: _id }, process.env.JWT_KEY!);

      return respond({ res, data: { userId: _id, email, jwtToken } });
    });
  }
);

authRouter.post(
  "/signUp",
  passport.authenticate("signup", { session: false }),
  async (req, res) => {
    return respond({ res, data: { message: "Signed up successfully!" } });
  }
);

// const isAuthenticatedMiddleware = (req, res, next) => {
//   if (req.user) {
//     return next();
//   } else {
//     respond({ res, error: "You are not authorized, try logging in again" });
//   }
// };

export { authRouter };
