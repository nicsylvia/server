"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = __importDefault(require("cloudinary"));
const EnvironmentVariables_1 = require("./EnvironmentVariables");
const cloudinary = cloudinary_1.default.v2;
cloudinary.config({
    cloud_name: "dev-sylvia",
    api_key: EnvironmentVariables_1.EnvironmentVariables.API_KEY,
    api_secret: EnvironmentVariables_1.EnvironmentVariables.API_SECRET,
    secure: true,
});
exports.default = cloudinary;
