"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const GiftCardControllers_1 = require("../Controllers/GiftCardControllers");
const GiftCardRoutes = express_1.default.Router();
GiftCardRoutes.route("/generateyourgiftcard/:businessID").post(GiftCardControllers_1.GenerateAGiftCard);
GiftCardRoutes.route("/getallgiftcards").get(GiftCardControllers_1.AllGiftCards);
GiftCardRoutes.route("/businessgiftcard/:businessID").get(GiftCardControllers_1.BusinessGiftCard);
GiftCardRoutes.route("/searchforgiftcard").post(GiftCardControllers_1.SearchForGiftCard);
exports.default = GiftCardRoutes;
