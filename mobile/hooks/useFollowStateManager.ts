import { useState, useCallback, useRef } from "react";

interface FollowState {
  isFollowing: boolean;
  isProcessing: boolean;
  lastAction?: number;
  error?: boolean;
}

export const useFollowStateManager = () => {
  const [followStates, setFollowStates] = useState<Record<string, FollowState>>(
    {}
  );
  const actionQueue = useRef<Map<string, AbortController>>(new Map());

  const updateState = useCallback(
    (userId: string, updates: Partial<FollowState>) => {
      setFollowStates((prev) => {
        const currentState = prev[userId] || {
          isFollowing: false,
          isProcessing: false,
          lastAction: 0,
          error: false,
        };

        return {
          ...prev,
          [userId]: {
            ...currentState,
            ...updates,
          },
        };
      });
    },
    []
  );

  const getState = useCallback(
    (userId: string): FollowState => {
      return (
        followStates[userId] || {
          isFollowing: false,
          isProcessing: false,
          lastAction: 0,
          error: false,
        }
      );
    },
    [followStates]
  );

  const cancelPendingAction = useCallback((userId: string) => {
    const controller = actionQueue.current.get(userId);
    if (controller) {
      controller.abort();
      actionQueue.current.delete(userId);
    }
  }, []);

  const queueAction = useCallback(
    (userId: string, controller: AbortController) => {
      cancelPendingAction(userId);
      actionQueue.current.set(userId, controller);
    },
    [cancelPendingAction]
  );

  const removeFromQueue = useCallback((userId: string) => {
    actionQueue.current.delete(userId);
  }, []);

  return {
    followStates,
    updateState,
    getState,
    queueAction,
    removeFromQueue,
    cancelPendingAction,
  };
};
