"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentVariables = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.EnvironmentVariables = {
    PORT: process.env.PORT,
    MONGODB_STRING: process.env.LIVE_URL,
    API_KEY: process.env.api_key,
    API_SECRET: process.env.api_secret,
    Kora_secret_key: process.env.Kora_secret_key,
    Encrypted_key: process.env.encrypt,
};
