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
exports.categoryRelations = exports.categories = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_orm_1 = require("drizzle-orm");
var userModel_1 = require("./userModel");
var columHelpers_1 = require("./columHelpers");
exports.categories = (0, pg_core_1.pgTable)('categories', __assign({ id: (0, pg_core_1.serial)('id').primaryKey(), name: (0, pg_core_1.text)('name').notNull(), userId: (0, pg_core_1.integer)('userId').notNull().references(function () { return userModel_1.users.id; }), parentCategoryId: (0, pg_core_1.integer)('parentCategoryId').references(function () { return exports.categories.id; }) }, columHelpers_1.timestampColumns));
exports.categoryRelations = (0, drizzle_orm_1.relations)(exports.categories, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        user: one(userModel_1.users, {
            fields: [exports.categories.userId],
            references: [userModel_1.users.id],
        }),
        parentCategory: one(exports.categories, {
            fields: [exports.categories.parentCategoryId],
            references: [exports.categories.id],
        }),
        subCategories: many(exports.categories),
    });
});
