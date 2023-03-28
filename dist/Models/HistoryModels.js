"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const HistorySchema = new mongoose_1.Schema({
    owner: {
        type: String,
    },
    message: {
        type: String,
    },
    transactionReference: {
        type: String,
    },
    transactionType: {
        type: String,
    },
    dateTime: {
        type: String,
    },
}, {
    timestamps: true,
});
const HistoryModels = (0, mongoose_1.model)("Histories", HistorySchema);
exports.default = HistoryModels;
