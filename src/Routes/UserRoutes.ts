import express from "express";
import { GetSingleBusinessHistory } from "../Controllers/BusinessControllers";
import {
  GetSingleUser,
  GetSingleUserHistory,
  UserBuyAGiftCardWithATMcard,
  UsersLogin,
  UsersRegistration,
} from "../Controllers/UserControllers";

import {
  UserRegisterValidation,
  UserLoginValidation,
} from "../Middlewares/UserValidation/UserValidation";

const UserRouter = express.Router();

UserRouter.route("/registeruser").post(
  UserRegisterValidation,
  UsersRegistration
);
UserRouter.route("/user/:userID/history").get(GetSingleUserHistory);
UserRouter.route("/loginuser").post(UserLoginValidation, UsersLogin);
UserRouter.route("/getsingleuser/:userID").get(GetSingleUser);
UserRouter.route("/buyagiftcard/:userID/:businessID/:giftcardID").post(
  UserBuyAGiftCardWithATMcard
);

export default UserRouter;
