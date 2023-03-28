"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessLoginValidation = exports.BusinessRegisterValidation = void 0;
const Validator_1 = require("../Validator");
const BusinessSchema_1 = require("./BusinessSchema");
const BusinessRegisterValidation = (req, res, next) => (0, Validator_1.Validator)(BusinessSchema_1.BusinessSchemaValidation.Register, req.body, next);
exports.BusinessRegisterValidation = BusinessRegisterValidation;
const BusinessLoginValidation = (req, res, next) => (0, Validator_1.Validator)(BusinessSchema_1.BusinessSchemaValidation.Login, req.body, next);
exports.BusinessLoginValidation = BusinessLoginValidation;
