import { RequestHandler } from "express";
import { Validator } from "../Validator";

import { BusinessSchemaValidation } from "./BusinessSchema";

export const BusinessRegisterValidation: RequestHandler = (req, res, next) =>
  Validator(BusinessSchemaValidation.Register, req.body, next);

export const BusinessLoginValidation: RequestHandler = (req, res, next) =>
  Validator(BusinessSchemaValidation.Login, req.body, next);
