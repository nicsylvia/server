"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchForGiftCard = exports.BusinessGiftCard = exports.AllGiftCards = exports.GenerateAGiftCard = void 0;
const AsyncHandler_1 = require("../Utils/AsyncHandler");
const AppError_1 = require("../Utils/AppError");
const GiftCardModels_1 = __importDefault(require("../Models/GiftCardModels"));
const BusinessModels_1 = __importDefault(require("../Models/BusinessModels"));
const mongoose_1 = __importDefault(require("mongoose"));
const UserModels_1 = __importDefault(require("../Models/UserModels"));
const DefaultImg = "https://www.shutterstock.com/image-vector/jewellery-dummy-vector-logo-template-600w-2165228765.jpg";
// Create a gift card:
exports.GenerateAGiftCard = (0, AsyncHandler_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { moneyWorth, colour } = req.body;
    const GetBusiness = yield BusinessModels_1.default.findById(req.params.businessID);
    const ALLUSER = yield UserModels_1.default.findById(req.params.userID);
    if (!GetBusiness) {
        next(new AppError_1.AppError({
            message: "Business Account not found",
            httpcode: AppError_1.HTTPCODES.NOT_FOUND,
        }));
    }
    if ((GetBusiness === null || GetBusiness === void 0 ? void 0 : GetBusiness.logo) === DefaultImg) {
        next(new AppError_1.AppError({
            message: "Dummy logo not allowed, Please upload a logo for your business first before generating a gift card",
            httpcode: AppError_1.HTTPCODES.SERVICE_UNAVAILABLE,
        }));
    }
    if (!(GetBusiness === null || GetBusiness === void 0 ? void 0 : GetBusiness.logo)) {
        next(new AppError_1.AppError({
            message: "Please upload a logo for your business first before generating a gift card",
            httpcode: AppError_1.HTTPCODES.SERVICE_UNAVAILABLE,
        }));
    }
    if (GetBusiness === null || GetBusiness === void 0 ? void 0 : GetBusiness.logo) {
        const GiftCard = yield GiftCardModels_1.default.create({
            name: GetBusiness === null || GetBusiness === void 0 ? void 0 : GetBusiness.name,
            BrandLogo: GetBusiness === null || GetBusiness === void 0 ? void 0 : GetBusiness.logo,
            uniqueID: GetBusiness === null || GetBusiness === void 0 ? void 0 : GetBusiness.BusinessCode,
            colour,
            moneyWorth,
        });
        yield (ALLUSER === null || ALLUSER === void 0 ? void 0 : ALLUSER.companyGiftCards.push(new mongoose_1.default.Types.ObjectId(GiftCard === null || GiftCard === void 0 ? void 0 : GiftCard._id)));
        yield (ALLUSER === null || ALLUSER === void 0 ? void 0 : ALLUSER.save());
        yield ((_a = GetBusiness === null || GetBusiness === void 0 ? void 0 : GetBusiness.giftCard) === null || _a === void 0 ? void 0 : _a.push(new mongoose_1.default.Types.ObjectId(GiftCard === null || GiftCard === void 0 ? void 0 : GiftCard._id)));
        GetBusiness === null || GetBusiness === void 0 ? void 0 : GetBusiness.save();
        return res.status(200).json({
            message: `A Gift card for ${GetBusiness === null || GetBusiness === void 0 ? void 0 : GetBusiness.name} with money worth of ${moneyWorth} successfully generated`,
            data: GiftCard,
        });
    }
}));
// Get all gift card in the database:
exports.AllGiftCards = (0, AsyncHandler_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const Giftcards = yield GiftCardModels_1.default.find().sort({ createdAt: -1 });
    if (!Giftcards) {
        next(new AppError_1.AppError({
            message: "Couldn't get all gift cards",
            httpcode: AppError_1.HTTPCODES.INTERNAL_SERVER_ERROR,
        }));
    }
    return res.status(200).json({
        message: `Successfully got all ${Giftcards.length} gift cards`,
        data: Giftcards,
    });
}));
// Get all gift card for a particular business:
exports.BusinessGiftCard = (0, AsyncHandler_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const Business = yield BusinessModels_1.default.findById(req.params.businessID)
        .populate({
        path: "giftCard",
    })
        .sort({ createdAt: -1 });
    if (!Business) {
        next(new AppError_1.AppError({
            message: `This business does not exist, \n Sign up to create an account \n Couldn't get this business gift cards`,
            httpcode: AppError_1.HTTPCODES.NOT_FOUND,
        }));
    }
    else {
        return res.status(200).json({
            message: `Successfully got all ${Business === null || Business === void 0 ? void 0 : Business.giftCard.length} gift cards generated by ${Business === null || Business === void 0 ? void 0 : Business.name}`,
            data: Business,
        });
    }
}));
// Search for a gift card by amount and name:
exports.SearchForGiftCard = (0, AsyncHandler_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const giftcard = yield GiftCardModels_1.default.findOne(req.query);
    if (!giftcard) {
        next(new AppError_1.AppError({
            message: "Gift card does not exist",
            httpcode: AppError_1.HTTPCODES.NOT_FOUND,
            name: "Unavailable",
        }));
    }
    return res.status(200).json({
        message: `Successfully got the searched gift card`,
        data: giftcard,
    });
}));
