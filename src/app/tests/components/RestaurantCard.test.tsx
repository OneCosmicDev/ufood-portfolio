import { render, screen } from '@testing-library/react';
import RestaurantCard from '../../components/RestaurantCard';
import Restaurant from '../../types/Restaurant';


describe('Restaurant Card', () => {
    test('renders restaurant card minimal informations', () => {
        const restaurant = anyRestaurant();

        render(<RestaurantCard restaurant={restaurant} />);

        expect(screen.getByText('name')).toBeInTheDocument();
        expect(screen.getByText('cuisine_types.Genre')).toBeInTheDocument();
        expect(() => screen.getByText('visit_text_multiple')).toThrow();
    });

    test('renders title and not name if title is used', () => {
        const anyName = 'name';
        const restaurant = restaurantWithName(anyName);
        const anyTitle = 'title'

        render(<RestaurantCard restaurant={restaurant} title={anyTitle} />);

        expect(screen.getByText(anyTitle)).toBeInTheDocument();
        expect(() => screen.getByText(anyName)).toThrow();
    });

    test('renders price string', () => {
        const anyPrice = 'price';
        const restaurant = restaurantWithPriceString(anyPrice);

        render(<RestaurantCard restaurant={restaurant} />);

        expect(screen.getByText(anyPrice)).toBeInTheDocument();
    });

    test('renders number of $ in parameter price_range', () => {
        const anyPriceNumber = 3;
        const expectedPriceShowned = '$$$'
        const restaurant = restaurantWithPriceNumber(anyPriceNumber);

        render(<RestaurantCard restaurant={restaurant} />);

        expect(screen.getByText(expectedPriceShowned)).toBeInTheDocument();
    });

    test('renders a number of $ depending on $ sent', () => {
        const anyNumberOfVisits = 3;
        const restaurant = restaurantWithVisits(anyNumberOfVisits);

        render(<RestaurantCard restaurant={restaurant} />);

        expect(screen.getByText("userProfile.visit_text_multiple")).toBeInTheDocument();
    });
});

function anyRestaurant(): Restaurant {
    return {
        id:"id",
        name: "name",
        genres:["genre"],
        address:"address",
        location: {
            type:"Point",
            coordinates: [1,1]
        }
    }
}

function restaurantWithName(name:string): Restaurant {
    return {
        id:"id",
        name: name,
        genres:["genre"],
        address:"address",
        location: {
            type:"Point",
            coordinates: [1,1]
        }
    }
}

function restaurantWithPriceString(price:string):Restaurant {
    return {
        id:"id",
        name: "name",
        genres:["genre"],
        address:"address",
        location: {
            type:"Point",
            coordinates: [1,1]
        },
        priceRange: price
    }
}

function restaurantWithPriceNumber(price:number):Restaurant {
    return {
        id:"id",
        name: "name",
        genres:["genre"],
        address:"address",
        location: {
            type:"Point",
            coordinates: [1,1]
        },
        priceRange: "number",
        price_range: price
    }
}

function restaurantWithVisits(numberVisits:number):Restaurant {
    return {
        id:"id",
        name: "name",
        genres:["genre"],
        address:"address",
        location: {
            type:"Point",
            coordinates: [1,1]
        },
        visits:numberVisits
    }
}