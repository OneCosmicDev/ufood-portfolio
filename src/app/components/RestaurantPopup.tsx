import React from "react";
import Restaurant from "../types/Restaurant";

interface RestaurantPopupProps {
    restaurant: Restaurant;
}

export const getRestaurantPopupHTML = (restaurant: Restaurant): string => {
    return `
        <div class="p-3 bg-white text-dark restaurant-popup">
            <div class="d-flex align-items-start mb-3">
                <div class="flex-grow-1">
                    <h6 class="fw-bold mb-1 text-dark">${restaurant.name}</h6>
                    ${restaurant.genres && restaurant.genres.length > 0 ?
        `<span class="badge bg-dark text-white border small">${restaurant.genres[0]}</span>` : ''}
                </div>
                ${restaurant.priceRange ?
        `<div class="ms-2">
                        <span class="badge bg-primary text-white">${restaurant.priceRange}</span>
                    </div>` : ''}
            </div>
            
            ${restaurant.address ? `
            <div class="d-flex align-items-center mb-2">
                <span class="text-dark small">${restaurant.address}</span>
            </div>` : ''}
            
            ${restaurant.genres && restaurant.genres.length > 1 ? `
            <div class="d-flex align-items-center mb-3">
                <span class="text-dark small">${restaurant.genres.slice(1).join(', ')}</span>
            </div>` : ''}
            
            <div class="border-top pt-3">
                <a href="/restaurant/${restaurant.id}" class="btn btn-primary btn-sm w-100">
                    Voir les détails / View details
                </a>
            </div>
        </div>
    `;
};


const RestaurantPopup: React.FC<RestaurantPopupProps> = ({ restaurant }) => {
    return <div dangerouslySetInnerHTML={{ __html: getRestaurantPopupHTML(restaurant) }} />;
};

export default RestaurantPopup;