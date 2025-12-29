"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.topicRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const topicController_1 = require("../controllers/topicController");
exports.topicRoutes = (0, express_1.Router)();
// GET topics - optional auth (for public browsing)
exports.topicRoutes.get('/', auth_1.optionalAuthenticate, topicController_1.getTopics);
// GET single topic - optional auth
exports.topicRoutes.get('/:id', auth_1.optionalAuthenticate, topicController_1.getTopic);
// All other routes require authentication
exports.topicRoutes.use(auth_1.authenticate);
exports.topicRoutes.post('/', topicController_1.createTopic);
exports.topicRoutes.put('/:id', topicController_1.updateTopic);
exports.topicRoutes.delete('/:id', topicController_1.deleteTopic);
exports.topicRoutes.post('/:id/join', topicController_1.joinTopic);
exports.topicRoutes.post('/:id/leave', topicController_1.leaveTopic);
