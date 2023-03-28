import express from "express";
import {
  AllGiftCards,
  BusinessGiftCard,
  GenerateAGiftCard,
  OneGiftCard,
  SearchForGiftCard,
} from "../Controllers/GiftCardControllers";

const GiftCardRoutes = express.Router();

GiftCardRoutes.route("/generateyourgiftcard/:businessID").post(
  GenerateAGiftCard
);
GiftCardRoutes.route("/getallgiftcards").get(AllGiftCards);
GiftCardRoutes.route("/getonegiftcard/:giftcardID").get(OneGiftCard);
GiftCardRoutes.route("/businessgiftcard/:businessID").get(BusinessGiftCard);
GiftCardRoutes.route("/searchforgiftcard").post(SearchForGiftCard);

export default GiftCardRoutes;
