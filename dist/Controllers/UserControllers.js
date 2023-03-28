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
exports.UserBuyAGiftCardWithATMcard = exports.GetSingleUser = exports.UsersLogin = exports.UsersRegistration = void 0;
const UserModels_1 = __importDefault(require("../Models/UserModels"));
const AsyncHandler_1 = require("../Utils/AsyncHandler");
const bcrypt_1 = __importDefault(require("bcrypt"));
const AppError_1 = require("../Utils/AppError");
const BusinessModels_1 = __importDefault(require("../Models/BusinessModels"));
const HistoryModels_1 = __importDefault(require("../Models/HistoryModels"));
const uuidv4_1 = require("uuidv4");
const mongoose_1 = __importDefault(require("mongoose"));
const GiftCardModels_1 = __importDefault(require("../Models/GiftCardModels"));
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const EnvironmentVariables_1 = require("../Config/EnvironmentVariables");
// My secret key from Kora dashboard
const secret = EnvironmentVariables_1.EnvironmentVariables.Kora_secret_key;
// Encrypted Key from Kora dashboard
const encrypt = EnvironmentVariables_1.EnvironmentVariables.Encrypted_key;
// Kora's API that we'll be hiiting on to do pay ins (zenith bank to wallet)
const urlData = "https://api.korapay.com/merchant/api/v1/charges/card";
// Function to encrypt the payment that will be coming in
function encryptAES256(encryptionKey, paymentData) {
    const iv = crypto_1.default.randomBytes(16);
    const cipher = crypto_1.default.createCipheriv("aes-256-gcm", encryptionKey, iv);
    const encrypted = cipher.update(paymentData);
    const ivToHex = iv.toString("hex");
    const encryptedToHex = Buffer.concat([encrypted, cipher.final()]).toString("hex");
    return `${ivToHex}:${encryptedToHex}:${cipher.getAuthTag().toString("hex")}`;
}
// Users Registration:
exports.UsersRegistration = (0, AsyncHandler_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phoneNumber, username, password } = req.body;
    const salt = yield bcrypt_1.default.genSalt(10);
    const hashedPassword = yield bcrypt_1.default.hash(password, salt);
    const findEmail = yield UserModels_1.default.findOne({ email });
    if (findEmail) {
        next(new AppError_1.AppError({
            message: "User with this account already exists",
            httpcode: AppError_1.HTTPCODES.FORBIDDEN,
        }));
    }
    const Users = yield UserModels_1.default.create({
        name,
        email,
        username,
        phoneNumber: "234" + phoneNumber,
        password: hashedPassword,
        confirmPassword: hashedPassword,
        status: "User",
    });
    return res.status(201).json({
        message: "Successfully created User",
        data: Users,
    });
}));
// Users Login:
exports.UsersLogin = (0, AsyncHandler_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const CheckEmail = yield UserModels_1.default.findOne({ email });
    if (!CheckEmail) {
        next(new AppError_1.AppError({
            message: "User not Found",
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
// Get a single User:
exports.GetSingleUser = (0, AsyncHandler_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const singleuser = yield UserModels_1.default.findById(req.params.userID).populate({
        path: "companyGiftCards",
    });
    if (!singleuser) {
        next(new AppError_1.AppError({
            message: "User not found",
            httpcode: AppError_1.HTTPCODES.NOT_FOUND,
        }));
    }
    return res.status(200).json({
        message: "Successfully got this single user",
        data: singleuser,
    });
}));
// User wants to buy a business gift card using Kora's APIs to make Payment with ATM card - // User wants to buy a business gift card using payment with their card:
exports.UserBuyAGiftCardWithATMcard = (0, AsyncHandler_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, name, number, cvv, pin, expiry_year, expiry_month, title, description, } = req.body;
    const GenerateTransactionReference = (0, uuidv4_1.uuid)();
    // To get both single user and business
    const user = yield UserModels_1.default.findById(req.params.userID);
    const Business = yield BusinessModels_1.default.findById(req.params.businessID);
    const giftcard = yield GiftCardModels_1.default.findById(req.params.giftcardID);
    if (!user && !Business && !giftcard) {
        next(new AppError_1.AppError({
            message: "Invalid Account, Does not exist",
            httpcode: AppError_1.HTTPCODES.NOT_FOUND,
        }));
    }
    // If no gift card from this business:
    if (!(Business === null || Business === void 0 ? void 0 : Business.giftCard)) {
        next(new AppError_1.AppError({
            message: `${Business === null || Business === void 0 ? void 0 : Business.name} does not have a gift card yet`,
            httpcode: AppError_1.HTTPCODES.NOT_FOUND,
        }));
    }
    if (user && Business && giftcard) {
        // For user to make the payment from their bank to business wallet:
        const paymentData = {
            reference: GenerateTransactionReference,
            card: {
                name,
                number,
                cvv,
                pin,
                expiry_year,
                expiry_month,
            },
            amount,
            currency: "NGN",
            redirect_url: "https://merchant-redirect-url.com",
            customer: {
                name: user === null || user === void 0 ? void 0 : user.name,
                email: user === null || user === void 0 ? void 0 : user.email,
            },
            metadata: {
                internalRef: "JD-12-67",
                age: 15,
                fixed: true,
            },
        };
        // To stringify the payment data coming in
        const stringData = JSON.stringify(paymentData);
        //The data should be in buffer form according to Kora's pay
        const bufData = Buffer.from(stringData, "utf-8");
        const encryptedData = encryptAES256(encrypt, bufData);
        var config = {
            method: "post",
            maxBodyLength: Infinity,
            url: urlData,
            headers: {
                Authorization: `Bearer ${secret}`,
            },
            data: {
                charge_data: `${encryptedData}`,
            },
        };
        (0, axios_1.default)(config)
            .then(function (response) {
            var _a, _b;
            return __awaiter(this, void 0, void 0, function* () {
                // To update the balance of the business with the amount the user bought with ATM card
                yield BusinessModels_1.default.findByIdAndUpdate(Business === null || Business === void 0 ? void 0 : Business._id, {
                    Balance: (Business === null || Business === void 0 ? void 0 : Business.Balance) + amount,
                });
                // To generate a receipt for the business and a notification
                const BusinesstransactionHistory = yield HistoryModels_1.default.create({
                    owner: Business === null || Business === void 0 ? void 0 : Business.name,
                    message: `${user === null || user === void 0 ? void 0 : user.name} bought a gift card from your store with money worth of ${amount}`,
                    transactionReference: GenerateTransactionReference,
                    transactionType: "Credit",
                });
                (_a = Business === null || Business === void 0 ? void 0 : Business.TransactionHistory) === null || _a === void 0 ? void 0 : _a.push(new mongoose_1.default.Types.ObjectId(BusinesstransactionHistory === null || BusinesstransactionHistory === void 0 ? void 0 : BusinesstransactionHistory._id));
                Business.save();
                // To update the history of the user with his/her debit alert of buying a gift card
                const UserTransactionHistory = yield HistoryModels_1.default.create({
                    owner: user === null || user === void 0 ? void 0 : user.name,
                    message: `You bought a gift card worth ${amount} from ${Business === null || Business === void 0 ? void 0 : Business.name}`,
                    transactionReference: GenerateTransactionReference,
                    transactionType: "Debit",
                });
                (_b = user === null || user === void 0 ? void 0 : user.TransactionHistory) === null || _b === void 0 ? void 0 : _b.push(new mongoose_1.default.Types.ObjectId(UserTransactionHistory === null || UserTransactionHistory === void 0 ? void 0 : UserTransactionHistory._id));
                user.save();
                return res.status(AppError_1.HTTPCODES.OK).json({
                    message: `${user === null || user === void 0 ? void 0 : user.name} successfully made payments for ${Business === null || Business === void 0 ? void 0 : Business.name} gift cards`,
                    data: {
                        paymentInfo: UserTransactionHistory,
                        paymentData: JSON.parse(JSON.stringify(response.data)),
                    },
                });
            });
        })
            .catch(function (error) {
            next(new AppError_1.AppError({
                message: "Transaction failed",
                httpcode: AppError_1.HTTPCODES.BAD_GATEWAY,
                name: "Network Error",
            }));
        });
    }
}));
