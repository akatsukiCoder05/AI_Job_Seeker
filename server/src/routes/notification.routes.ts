import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import { protect } from "../middleware/auth.middleware";

const notificationRouter = Router();

notificationRouter.get(
  "/",
  protect as any,
  notificationController.getMyNotifications as any
);

notificationRouter.patch(
  "/:id/read",
  protect as any,
  notificationController.markNotificationRead as any
);

export default notificationRouter;
