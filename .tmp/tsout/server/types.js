"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUDGET_TYPES = exports.TRANSACTION_TYPES = exports.INVESTMENT_TYPES = void 0;
var transactionModel_1 = require("./resources/models/transactionModel");
exports.INVESTMENT_TYPES = transactionModel_1.investmentTypes.enumValues;
exports.TRANSACTION_TYPES = transactionModel_1.transactionTypes.enumValues;
var BUDGET_TYPES;
(function (BUDGET_TYPES) {
    BUDGET_TYPES["ANNUALY"] = "annualy";
    BUDGET_TYPES["QUARTERLY"] = "quarterly";
    BUDGET_TYPES["MONTHLY"] = "monthly";
    BUDGET_TYPES["WEEKLY"] = "weekly";
    BUDGET_TYPES["DAILY"] = "daily";
})(BUDGET_TYPES || (exports.BUDGET_TYPES = BUDGET_TYPES = {}));
/* eslint-enable no-unused-vars */
