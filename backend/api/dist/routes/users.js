"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const userController_1 = require("../controllers/userController");
exports.userRoutes = (0, express_1.Router)();
// All user routes require authentication
exports.userRoutes.use(auth_1.authenticate);
exports.userRoutes.get('/profile', userController_1.getProfile);
exports.userRoutes.put('/profile', userController_1.updateProfile);
exports.userRoutes.post('/avatar', userController_1.uploadAvatar);
