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
exports.CheckOutToBank = exports.UpdateBusinessLogo = exports.GetSingleBusinessCards = exports.GetSingleBusinessAcount = exports.BusinessLogin = exports.BusinessRegistration = void 0;
const AsyncHandler_1 = require("../Utils/AsyncHandler");
const bcrypt_1 = __importDefault(require("bcrypt"));
const otp_generator_1 = __importDefault(require("otp-generator"));
const AppError_1 = require("../Utils/AppError");
const BusinessModels_1 = __importDefault(require("../Models/BusinessModels"));
const uuidv4_1 = require("uuidv4");
const axios_1 = __importDefault(require("axios"));
const mongoose_1 = __importDefault(require("mongoose"));
const HistoryModels_1 = __importDefault(require("../Models/HistoryModels"));
const EnvironmentVariables_1 = require("../Config/EnvironmentVariables");
const Cloudinary_1 = __importDefault(require("../Config/Cloudinary"));
const DefaultImg = "https://www.shutterstock.com/image-vector/jewellery-dummy-vector-logo-template-600w-2165228765.jpg";
// Users Registration:
exports.BusinessRegistration = (0, AsyncHandler_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, confirmPassword, phoneNumber } = req.body;
    const findEmail = yield BusinessModels_1.default.findOne({ email });
    if (findEmail) {
        next(new AppError_1.AppError({
            message: "Business with this account already exists",
            httpcode: AppError_1.HTTPCODES.FORBIDDEN,
        }));
    }
    const salt = yield bcrypt_1.default.genSalt(10);
    const hashedPassword = yield bcrypt_1.default.hash(password, salt);
    const codename = name.slice(0, 3);
    const Business = yield BusinessModels_1.default.create({
        name,
        email,
        phoneNumber: "+234" + phoneNumber,
        password: hashedPassword,
        confirmPassword: hashedPassword,
        logo: req.file ? req.file.path : DefaultImg,
        BusinessCode: codename +
            otp_generator_1.default.generate(20, {
                upperCaseAlphabets: false,
                specialChars: false,
                digits: true,
                lowerCaseAlphabets: false,
            }),
        Balance: 0,
        status: "Business",
    });
    return res.status(201).json({
        message: "Successfully created Business Account",
        data: Business,
    });
}));
// Business Login:
exports.BusinessLogin = (0, AsyncHandler_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const CheckEmail = yield BusinessModels_1.default.findOne({ email });
    if (!CheckEmail) {
        next(new AppError_1.AppError({
            message: "Business Account not Found",
            httpcode: AppError_1.HTTPCODES.NOT_FOUND,
        }));
    }
    const CheckPassword = yield bcrypt_1.default.compare(password, CheckEmail.password);
    if (!CheckPassword) {
        next(new AppError_1.AppError({
            message: "Email or password not correct",
            httpcode: AppError_1.HTTPCODES.CONFLICT,
        }));
    }
    if (CheckEmail && CheckPassword) {
        return res.status(200).json({
            message: "Login Successfull",
            data: CheckEmail,
        });
    }
}));
// Get single Business Account:
exports.GetSingleBusinessAcount = (0, AsyncHandler_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const SingleBusiness = yield BusinessModels_1.default.findById(req.params.businessID);
    if (!SingleBusiness) {
        next(new AppError_1.AppError({
            message: "Business Account not found",
            httpcode: AppError_1.HTTPCODES.NOT_FOUND,
        }));
    }
    return res.status(200).json({
        message: "Successfully got this business account",
        data: SingleBusiness,
    });
}));
// Get single Business Account:
exports.GetSingleBusinessCards = (0, AsyncHandler_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const SingleBusiness = yield BusinessModels_1.default.findById(req.params.businessID);
    if (!SingleBusiness) {
        next(new AppError_1.AppError({
            message: "Business Account not found",
            httpcode: AppError_1.HTTPCODES.NOT_FOUND,
        }));
    }
    const cards = yield BusinessModels_1.default.findById(req.params.businessID).populate({
        path: "giftCard",
        options: {
            sort: { createdAt: -1 },
        },
    });
    return res.status(200).json({
        message: "Successfully got this business account",
        data: cards.giftCard,
    });
}));
// Update Business Details:
exports.UpdateBusinessLogo = (0, AsyncHandler_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // const { logo } = req.body;
    var _a;
    const CloudImg = yield ((_a = Cloudinary_1.default.uploader) === null || _a === void 0 ? void 0 : _a.upload(req === null || req === void 0 ? void 0 : req.file.path));
    const BusinessLogo = yield BusinessModels_1.default.findByIdAndUpdate(req.params.id, { logo: CloudImg.secure_url }, { new: true });
    if (!BusinessLogo) {
        next(new AppError_1.AppError({
            message: "An error occured in updating business logo",
            httpcode: AppError_1.HTTPCODES.INTERNAL_SERVER_ERROR,
        }));
    }
    return res.status(201).json({
        message: "Successfully updated the business brand logo",
        data: BusinessLogo,
    });
}));
const secret = EnvironmentVariables_1.EnvironmentVariables.Kora_secret_key;
// Business Transfer the funds they have in their business account to their bank:
exports.CheckOutToBank = (0, AsyncHandler_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Get the business details wanting to transfer the money:
    const Business = yield BusinessModels_1.default.findById(req.params.businessID);
    const newDate = new Date().toDateString();
    const TransferReference = (0, uuidv4_1.uuid)();
    const { amount, name, number, cvv, pin, expiry_year, expiry_month, title, description, } = req.body;
    if (amount > Business.Balance) {
        return res.status(AppError_1.HTTPCODES.FORBIDDEN).json({
            message: "Insufficient Funds",
        });
    }
    else {
        let data = JSON.stringify({
            reference: TransferReference,
            destination: {
                type: "bank_account",
                amount: `${amount}`,
                currency: "NGN",
                narration: "Test Transfer Payment",
                bank_account: {
                    bank: "033",
                    account: "0000000000",
                },
                customer: {
                    name: Business === null || Business === void 0 ? void 0 : Business.name,
                    email: Business === null || Business === void 0 ? void 0 : Business.email,
                },
            },
        });
        var config = {
            method: "post",
            maxBodyLength: Infinity,
            url: "https://api.korapay.com/merchant/api/v1/transactions/disburse",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${secret}`,
            },
            data: data,
        };
        (0, axios_1.default)(config)
            .then(function (response) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                // To update the balance of the business with the amount the business withdrawed
                yield BusinessModels_1.default.findByIdAndUpdate(Business === null || Business === void 0 ? void 0 : Business._id, {
                    Balance: Business.Balance - amount,
                    dateTime: newDate,
                });
                // To generate a receipt for the business and a notification
                const BusinessWithdrawalHistory = yield HistoryModels_1.default.create({
                    owner: Business === null || Business === void 0 ? void 0 : Business.name,
                    message: `Dear ${Business === null || Business === void 0 ? void 0 : Business.name}, a withdrawal of ${amount} was made from your account and your balance is ${Business === null || Business === void 0 ? void 0 : Business.Balance}`,
                    transactionReference: TransferReference,
                    transactionType: "Debit",
                    dateTime: newDate,
                });
                (_a = Business === null || Business === void 0 ? void 0 : Business.TransactionHistory) === null || _a === void 0 ? void 0 : _a.push(new mongoose_1.default.Types.ObjectId(BusinessWithdrawalHistory === null || BusinessWithdrawalHistory === void 0 ? void 0 : BusinessWithdrawalHistory._id));
                Business === null || Business === void 0 ? void 0 : Business.save();
                return res.status(201).json({
                    message: `${Business === null || Business === void 0 ? void 0 : Business.name} successfully withdrawed ${amount} from account`,
                    data: {
                        paymentInfo: BusinessWithdrawalHistory,
                        paymentData: JSON.parse(JSON.stringify(response.data)),
                    },
                });
            });
        })
            .catch(function (error) {
            console.log(error);
        });
    }
}));
