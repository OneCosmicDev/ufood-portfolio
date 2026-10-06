import { useMutation, useQueryClient } from "@tanstack/react-query";
import { visitService } from "../api/visitService";
import { fetchAllVisits } from "../api/queryClient";
import { CreateVisitRequest } from "../types/Visit";

interface UseVisitMutationProps {
  userId: string;
  onSuccess?: (visitId: string) => void;
  onError?: (message: string) => void;
  token: string;
}

export const useVisitMutation = ({ userId, onSuccess, onError, token }: UseVisitMutationProps) => {
  const queryClient = useQueryClient();

  const createVisitMutation = useMutation({
    mutationFn: async (data: CreateVisitRequest) => await visitService.createVisit(data, token),
    onSuccess: async (response) => {
      const newVisitId = response?.id || response?.items?.id;
      
      await queryClient.invalidateQueries({ queryKey: ["visits", userId] });
      
      try {
        const freshVisits = await fetchAllVisits(userId, token);
        const existingCachedVisits = queryClient.getQueryData<any[]>(["visits", userId]) || [];
        
        const visitsMap = new Map<string, any>();
        
        freshVisits.forEach((visit: any) => {
          if (visit.id) {
            visitsMap.set(visit.id, visit);
          }
        });
        
        existingCachedVisits.forEach((visit: any) => {
          if (visit.id && !visitsMap.has(visit.id)) {
            visitsMap.set(visit.id, visit);
          }
        });
        
        if (newVisitId && !visitsMap.has(newVisitId)) {
          const newVisitObject = {
            id: newVisitId,
            restaurant_id: response.restaurant_id || response.restaurantId,
            comment: response.comment,
            rating: response.rating,
            date: response.date,
            user_id: userId
          };
          visitsMap.set(newVisitId, newVisitObject);
        }
        
        const finalVisits = Array.from(visitsMap.values());
        queryClient.setQueryData(["visits", userId], finalVisits);
        
        if (onSuccess) {
          onSuccess(newVisitId);
        }
      } catch (fetchError) {
        console.error('[ERROR] useVisitMutation.fetchVisits:', fetchError);
        await queryClient.refetchQueries({ 
          queryKey: ["visits", userId],
          type: 'all'
        });
      }
    },
    onError: (err: Error) => {
      if (onError) {
        onError(err.message);
      }
    },
  });

  return {
    createVisitMutation,
  };
};

