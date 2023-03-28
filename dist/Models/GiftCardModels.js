"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const GiftCardSchema = new mongoose_1.Schema({
    name: {
        type: String,
    },
    BrandLogo: {
        type: String,
    },
    uniqueID: {
        type: String,
    },
    colour: {
        type: String,
    },
    dateTime: {
        type: String,
    },
    moneyWorth: {
        type: Number,
        required: [true, "Please enter the money worth of card"],
    },
}, {
    timestamps: true,
});
const GiftCardModels = (0, mongoose_1.model)("GiftCards", GiftCardSchema);
exports.default = GiftCardModels;
