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
exports.budgetToCategoriesRelations = exports.budgetRelations = exports.budgetToCategories = exports.budgets = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_orm_1 = require("drizzle-orm");
var userModel_1 = require("./userModel");
var categoryModel_1 = require("./categoryModel");
var columHelpers_1 = require("./columHelpers");
exports.budgets = (0, pg_core_1.pgTable)('budgets', __assign({ id: (0, pg_core_1.serial)().primaryKey(), name: (0, pg_core_1.text)().notNull(), value: (0, pg_core_1.numeric)({ precision: 14, scale: 2 }).notNull(), type: (0, pg_core_1.text)().notNull(), startDate: (0, pg_core_1.timestamp)().notNull(), endDate: (0, pg_core_1.timestamp)().notNull(), userId: (0, pg_core_1.integer)().notNull().references(function () { return userModel_1.users.id; }) }, columHelpers_1.timestampColumns));
exports.budgetToCategories = (0, pg_core_1.pgTable)('budgetToCategories', __assign({ budgetId: (0, pg_core_1.integer)().notNull().references(function () { return exports.budgets.id; }), categoryId: (0, pg_core_1.integer)().notNull().references(function () { return categoryModel_1.categories.id; }) }, columHelpers_1.timestampColumns), function (table) { return ([
    (0, pg_core_1.primaryKey)({ columns: [table.budgetId, table.categoryId] }),
]); });
exports.budgetRelations = (0, drizzle_orm_1.relations)(exports.budgets, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        user: one(userModel_1.users, {
            fields: [exports.budgets.userId],
            references: [userModel_1.users.id],
        }),
        categories: many(exports.budgetToCategories),
    });
});
exports.budgetToCategoriesRelations = (0, drizzle_orm_1.relations)(exports.budgetToCategories, function (_a) {
    var one = _a.one;
    return ({
        budget: one(exports.budgets, {
            fields: [exports.budgetToCategories.budgetId],
            references: [exports.budgets.id],
        }),
        category: one(categoryModel_1.categories, {
            fields: [exports.budgetToCategories.categoryId],
            references: [categoryModel_1.categories.id],
        }),
    });
});
