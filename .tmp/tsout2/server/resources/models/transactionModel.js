"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionRelations = exports.transactionToGoals = exports.transactions = exports.investmentTypes = exports.transactionTypes = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_orm_1 = require("drizzle-orm");
var userModel_1 = require("./userModel");
var categoryModel_1 = require("./categoryModel");
var columHelpers_1 = require("./columHelpers");
var accountModel_1 = require("./accountModel");
var goalModel_1 = require("./goalModel");
exports.transactionTypes = (0, pg_core_1.pgEnum)('transactionTypes', [
    'withdraw',
    'transferIn',
    'transferOut',
    'deposit',
    'bankSlip',
    'cardPurchase',
    'cardRefund',
    'payment',
    'investmentBuy',
    'investmentSell',
    'investmentDividend',
    'investmentInterest',
]);
exports.investmentTypes = (0, pg_core_1.pgEnum)('investmentTypes', [
    'cdb',
    'lci',
    'lca',
    'stock',
    'fund',
    'cra',
    'cri',
    'debenture',
    'currency',
    'lc',
    'lf',
    'fii',
    'tresury',
    'mutual_fund',
    'crypto',
    'real_estate',
    'other',
]);
exports.transactions = (0, pg_core_1.pgTable)('transactions', __assign({ id: (0, pg_core_1.serial)().primaryKey(), name: (0, pg_core_1.text)().notNull(), categoryId: (0, pg_core_1.integer)().references(function () { return categoryModel_1.categories.id; }), accountId: (0, pg_core_1.integer)().notNull().references(function () { return accountModel_1.accounts.id; }), type: (0, exports.transactionTypes)().notNull(), date: (0, pg_core_1.timestamp)().notNull(), value: (0, pg_core_1.numeric)({ precision: 14, scale: 2 }).notNull(), investmentType: (0, exports.investmentTypes)(), userId: (0, pg_core_1.integer)().notNull().references(function () { return userModel_1.users.id; }) }, columHelpers_1.timestampColumns));
exports.transactionToGoals = (0, pg_core_1.pgTable)('transactionToGoals', __assign({ transactionId: (0, pg_core_1.integer)().notNull().references(function () { return exports.transactions.id; }), goalId: (0, pg_core_1.integer)().notNull().references(function () { return goalModel_1.goals.id; }) }, columHelpers_1.timestampColumns), function (table) { return ([
    (0, pg_core_1.primaryKey)({ columns: [table.transactionId, table.goalId] }),
]); });
exports.transactionRelations = (0, drizzle_orm_1.relations)(exports.transactions, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        user: one(userModel_1.users, {
            fields: [exports.transactions.userId],
            references: [userModel_1.users.id],
        }),
        category: one(categoryModel_1.categories, {
            fields: [exports.transactions.categoryId],
            references: [categoryModel_1.categories.id],
        }),
        account: one(accountModel_1.accounts, {
            fields: [exports.transactions.accountId],
            references: [accountModel_1.accounts.id],
        }),
        goals: many(exports.transactionToGoals),
    });
});
