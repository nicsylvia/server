"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessSchemaValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.BusinessSchemaValidation = {
    Register: joi_1.default.object({
        name: joi_1.default.string().required(),
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(8).required(),
        confirmPassword: joi_1.default.string().valid(joi_1.default.ref("password")).required(),
    }),
    Login: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(8).required(),
    }),
};
