import { Response, NextFunction } from "express";
import Notification from "../models/notification.model";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

// Get list of notifications for own user
export const getMyNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
export const markNotificationRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const notificationId = req.params.id;
    const userId = req.user?._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({
        success: false,
        error: { message: "Notification not found" },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};
