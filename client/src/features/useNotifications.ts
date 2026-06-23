import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/axios";

export interface INotification {
  _id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  success: boolean;
  data: INotification[];
}

export const useNotifications = () => {
  const queryClient = useQueryClient();

  // Query own seeker notifications — accepts `enabled` flag to avoid conditional hook calls
  const useGetMyNotifications = (enabled: boolean = true) => {
    return useQuery<NotificationsResponse>({
      queryKey: ["myNotifications"],
      queryFn: async () => {
        const response = await api.get("/notifications");
        return response.data;
      },
      refetchInterval: enabled ? 15000 : false,
      enabled,
    });
  };

  // Mark notification as read
  const useMarkNotificationRead = () => {
    return useMutation<any, Error, { id: string }>({
      mutationFn: async ({ id }) => {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["myNotifications"] });
      },
    });
  };

  return {
    useGetMyNotifications,
    useMarkNotificationRead,
  };
};

export default useNotifications;
