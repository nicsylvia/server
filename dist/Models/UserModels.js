"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const isEmail_1 = __importDefault(require("validator/lib/isEmail"));
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        lowercase: true,
        trim: true,
        validate: [isEmail_1.default, "Please enter a valid email"],
    },
    image: {
        type: String,
    },
    username: {
        type: String,
        required: [true, "Please enter a suitable username"],
    },
    phoneNumber: {
        type: Number,
    },
    password: {
        type: String,
        required: [true, "Please enter your Password"],
    },
    confirmPassword: {
        type: String,
        required: [true, "Please confirm your password"],
    },
    dateTime: {
        type: String,
    },
    status: {
        type: String,
        required: [true, "Please enter your status"],
        message: "You must either be a User or for Business",
        enum: ["User", "Business"],
        default: "User",
    },
    TransactionHistory: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Histories",
        },
    ],
    companyGiftCards: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "GiftCards",
        },
    ],
    PurchasedGiftCards: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "GiftCards",
        },
    ],
}, {
    timestamps: true,
});
const UserModels = (0, mongoose_1.model)("Users", UserSchema);
exports.default = UserModels;
