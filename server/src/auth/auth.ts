import passport from "passport";
import {
  IStrategyOptionsWithRequest,
  Strategy as LocalStrategy,
} from "passport-local";
import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt";
import { UserModel } from "../schemas/user";
import { createUserAgentIfDoesntExist } from "../agents";
import { AES, enc } from "crypto-js";
import { decryptAES, obtainAppPassword } from "../utils/crypto";

const localStrategyOptions: IStrategyOptionsWithRequest = {
  usernameField: "email",
  passwordField: "password",
  passReqToCallback: true,
  session: false,
};

passport.use(
  "signup",
  new LocalStrategy(
    localStrategyOptions,
    async (req, _email, _password, done) => {
      try {
        const data = req.body;
        const { email, password, appPassword } = data;

        // if (await userAlreadyExists(email)) {
        //   done({ message: "An account with this email already exists." });
        // }

        const user = await UserModel.create({
          email,
          password,
          appPassword,
        });

        return done(null, user);
      } catch (error) {
        console.log("SignUp error:", error);
        done(error);
      }
    }
  )
);

passport.use(
  "login",
  new LocalStrategy(
    localStrategyOptions,
    async (_req, email, password, done) => {
      try {
        const user = await UserModel.findOne({ email });
        if (!user) {
          return done("User not found");
        }

        const {
          _id: userId,
          password: hashedPassword,
          appPassword: hashedAppPassword,
        } = user;

        const isValidatedPassword = await validatePassword(
          password,
          hashedPassword
        );
        if (!isValidatedPassword) {
          return done("Incorrect password");
        }

        const appPassword = obtainAppPassword(hashedAppPassword, password);

        createUserAgentIfDoesntExist(userId.toString(), email, appPassword);

        return done(null, user, { message: "Logged in successfully!" });
      } catch (error) {
        console.log("Login error: ", error);
        done(error);
      }
    }
  )
);
passport.use(
  new JWTStrategy(
    {
      secretOrKey: process.env.JWT_KEY!,
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("Bearer"),
    },
    async (token, done) => {
      try {
        const { id } = token;
        return done(null, id);
      } catch (error) {
        console.log(error);
        done(error);
      }
    }
  )
);

const validatePassword = async (password: string, hashed_password: string) => {
  const decryptedPassword = decryptAES(hashed_password, password);
  if (decryptedPassword === password) return true;
};

const userAlreadyExists = async (email: string) => {
  const user = UserModel.findOne({ email });

  return !!user;
};
