import { FavoriteList } from "../types/FavoriteList";
import { AxiosError } from "axios";


const getOwnerEmail = (owner: unknown): string | undefined => {
  if (!owner) return undefined;
  if (typeof owner === 'string') return owner;
  if (typeof owner === 'object' && owner !== null && 'email' in owner && typeof owner.email === 'string') return owner.email;
  return undefined;
};


export const isListOwner = (list: FavoriteList, currentUserEmail: string | undefined): boolean => {
  if (!currentUserEmail) {
    return false;
  }
  
  const ownerEmail = getOwnerEmail(list.owner);
  if (!ownerEmail) {
    return false;
  }
  
  return ownerEmail.toLowerCase().trim() === currentUserEmail.toLowerCase().trim();
};


export const getFavoriteListErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    
    if (status === 403) {
      return "favorites.forbidden";
    }
    if (status === 401) {
      return "favorites.unauthorized";
    }
  }
  
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }
  
  return defaultMessage;
};
