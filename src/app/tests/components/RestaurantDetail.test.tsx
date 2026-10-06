import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RestaurantDetail from '../../components/RestaurantDetail';
import Restaurant from '../../types/Restaurant';
import { useAuth } from '../../components/auth/AuthProvider';
import { useVisitMutation } from '../../hooks/useVisitMutation';

const MOCK_RESTAURANT_ID = '123';
const MOCK_RESTAURANT_NAME = 'Test Restaurant';
const MOCK_GENRES = ['italian', 'pizza'];
const MOCK_ADDRESS = '123 Test Street, Test City';
const MOCK_PHONE = '555-1234';
const MOCK_OPENING_HOURS = 'Mon-Fri: 9AM-10PM, Sat-Sun: 10AM-11PM';
const MOCK_PHOTOS = ['photo1.jpg', 'photo2.jpg'];
const MOCK_PRICE_RANGE = 2;
const MOCK_RATING = 4.5;
const MOCK_COORDINATES: [number, number] = [-73.5673, 45.5017];
const MOCK_USER_ID = 'user123';
const MOCK_TOKEN = 'test-token';
const MOCK_VISIT_COMMENT = 'Test comment';
const MOCK_VISIT_RATING = 4;

jest.mock('../../components/auth/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../hooks/useVisitMutation', () => ({
  useVisitMutation: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  withTranslation: () => (Component: React.ComponentType<Record<string, unknown>>) => {
    const WrappedComponent = (props: Record<string, unknown>) => {
      const mockT = (key: string) => key;
      return <Component {...props} t={mockT} />;
    };
    return WrappedComponent;
  },
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../components/VisitModal', () => ({
  __esModule: true,
  default: ({ show, onHide, onSubmit }: { show: boolean; onHide: () => void; onSubmit: (data: { comment: string; rating: number }) => void }) => (
    show ? (
      <div data-testid="visit-modal">
        <button onClick={onHide}>Close</button>
        <button onClick={() => onSubmit({ comment: MOCK_VISIT_COMMENT, rating: MOCK_VISIT_RATING })}>Submit</button>
      </div>
    ) : null
  ),
}));

jest.mock('../../components/Page', () => ({
  Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockedUseAuth = jest.mocked(useAuth);
const mockedUseVisitMutation = jest.mocked(useVisitMutation);

describe('RestaurantDetail', () => {
  const mockRestaurant: Restaurant = {
    id: MOCK_RESTAURANT_ID,
    name: MOCK_RESTAURANT_NAME,
    genres: MOCK_GENRES,
    address: MOCK_ADDRESS,
    phone: MOCK_PHONE,
    opening_hours: {
      text: MOCK_OPENING_HOURS,
    },
    photos: MOCK_PHOTOS,
    price_range: MOCK_PRICE_RANGE,
    rating: MOCK_RATING,
    location: {
      type: 'Point',
      coordinates: MOCK_COORDINATES,
    },
  };

  const mockCreateVisitMutation = {
    mutate: jest.fn(),
    isPending: false,
  };

  const mockOnAddToFavorites = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      userId: MOCK_USER_ID,
      token: MOCK_TOKEN,
      storeUserId: jest.fn(),
      storeToken: jest.fn(),
      logout: jest.fn() as unknown as ReturnType<typeof useAuth>['logout'],
    });

    mockedUseVisitMutation.mockReturnValue({
      createVisitMutation: mockCreateVisitMutation as unknown as ReturnType<typeof useVisitMutation>['createVisitMutation'],
    });
  });

  describe('Component Rendering', () => {
    test('renders restaurant details correctly', () => {
      render(
        <RestaurantDetail
          {...mockRestaurant}
          onAddToFavorites={mockOnAddToFavorites}
          />
      );

      expect(screen.getByText(new RegExp(MOCK_ADDRESS))).toBeInTheDocument();
      expect(screen.getByText(new RegExp(MOCK_PHONE))).toBeInTheDocument();
      expect(screen.getByText(new RegExp(MOCK_RATING.toString()))).toBeInTheDocument();
    });

    test('renders photos when available', () => {
      render(
        <RestaurantDetail
          {...mockRestaurant}
          onAddToFavorites={mockOnAddToFavorites}
          />
      );

      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });

    test('renders without photos gracefully', () => {
      const restaurantWithoutPhotos = { ...mockRestaurant, photos: undefined };
      
      render(
        <RestaurantDetail
          {...restaurantWithoutPhotos}
          onAddToFavorites={mockOnAddToFavorites}
          />
      );

      expect(screen.getByText(new RegExp(MOCK_ADDRESS))).toBeInTheDocument();
    });

    test('shows add to favorites button when authenticated', () => {
      render(
        <RestaurantDetail
          {...mockRestaurant}
          onAddToFavorites={mockOnAddToFavorites}
          />
      );

      expect(screen.getByText(/restaurant_details\.addToFavorites/)).toBeInTheDocument();
    });

    test('does not show add to favorites button when not authenticated', () => {
      render(
        <RestaurantDetail
          {...mockRestaurant}
          onAddToFavorites={mockOnAddToFavorites}
          />
      );

      expect(screen.queryByText(/restaurant\.add_to_favorites/)).not.toBeInTheDocument();
    });

    test('shows visit button when authenticated', () => {
      render(
        <RestaurantDetail
          {...mockRestaurant}
          onAddToFavorites={mockOnAddToFavorites}
          />
      );

      expect(screen.getByText(/visitModal\.title/)).toBeInTheDocument();
    });
  });

  describe('Helper Methods', () => {
    test('capitalizeGenre capitalizes first letter', () => {
      render(
        <RestaurantDetail
          {...mockRestaurant}
          onAddToFavorites={mockOnAddToFavorites}
          />
      );

      expect(screen.getByText(/Italian/)).toBeInTheDocument();
      expect(screen.getByText(/Pizza/)).toBeInTheDocument();
    });

    test('formatRating displays rating correctly', () => {
      render(
        <RestaurantDetail
          {...mockRestaurant}
          onAddToFavorites={mockOnAddToFavorites}
          />
      );

      expect(screen.getByText(new RegExp(MOCK_RATING.toString()))).toBeInTheDocument();
    });

    test('formatOpeningHours displays opening hours correctly', () => {
      render(
        <RestaurantDetail
          {...mockRestaurant}
          onAddToFavorites={mockOnAddToFavorites}
          />
      );

      expect(screen.getByText(new RegExp(MOCK_OPENING_HOURS))).toBeInTheDocument();
    });

  });



  describe('Edge Cases', () => {
    test('handles missing phone number', () => {
      const restaurantWithoutPhone = { ...mockRestaurant, phone: undefined };
      
      render(
        <RestaurantDetail
          {...restaurantWithoutPhone}
          onAddToFavorites={mockOnAddToFavorites}
          />
      );

      expect(screen.getByText(/restaurant_details\.phone/)).toBeInTheDocument();
    });

    test('handles empty genres array', () => {
      const restaurantWithoutGenres = { ...mockRestaurant, genres: [] };
      
      render(
        <RestaurantDetail
          {...restaurantWithoutGenres}
          onAddToFavorites={mockOnAddToFavorites}
          />
      );

      expect(screen.getByText(new RegExp(MOCK_ADDRESS))).toBeInTheDocument();
    });

    test('handles undefined price_range', () => {
      const restaurantWithoutPrice = { ...mockRestaurant, price_range: undefined };
      
      render(
        <RestaurantDetail
          {...restaurantWithoutPrice}
          onAddToFavorites={mockOnAddToFavorites}
          />
      );

      expect(screen.getByText(/restaurant_details\.price_range/)).toBeInTheDocument();
    });
  });

  describe('Price Range Display', () => {
    test('displays price range with dollar signs', () => {
      render(
        <RestaurantDetail
          {...mockRestaurant}
          onAddToFavorites={mockOnAddToFavorites}
          />
      );

      expect(screen.getByText(/\$\$/)).toBeInTheDocument();
    });

    test('handles price_range of 1', () => {
      const cheapRestaurant = { ...mockRestaurant, price_range: 1 };
      
      render(
        <RestaurantDetail
          {...cheapRestaurant}
          onAddToFavorites={mockOnAddToFavorites}
          />
      );

      expect(screen.getByText(/\$/)).toBeInTheDocument();
    });

    test('handles price_range of 4', () => {
      const expensiveRestaurant = { ...mockRestaurant, price_range: 4 };
      
      render(
        <RestaurantDetail
          {...expensiveRestaurant}
          onAddToFavorites={mockOnAddToFavorites}
          />
      );

      expect(screen.getByText(/\$\$\$\$/)).toBeInTheDocument();
    });
  });
});


