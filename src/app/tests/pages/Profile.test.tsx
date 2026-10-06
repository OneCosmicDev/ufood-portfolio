import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Profile from '../../pages/Profile';
import { useAuth } from '../../components/auth/AuthProvider';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import User from '../../types/User';

const MOCK_USER_ID = 'user123';
const MOCK_CURRENT_USER_ID = 'currentUser456';
const MOCK_USER_NAME = 'John Doe';
const MOCK_USER_EMAIL = 'john.doe@example.com';
const MOCK_USER_RATING = 4.5;
const MOCK_TOKEN = 'test-token';

const MOCK_FOLLOWERS = [
  { id: 'follower1', name: 'Follower One', email: 'follower1@test.com' },
  { id: 'follower2', name: 'Follower Two', email: 'follower2@test.com' }
];

const MOCK_FOLLOWING = [
  { id: 'following1', name: 'Following One', email: 'following1@test.com' }
];

jest.mock('../../components/auth/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {},
    ready: true,
  }),
  withTranslation: () => (Component: React.ComponentType<Record<string, unknown>>) => {
    const WrappedComponent = (props: Record<string, unknown>) => {
      const mockT = (key: string) => key;
      return <Component {...props} t={mockT} />;
    };
    return WrappedComponent;
  },
}));

jest.mock('../../components/Page', () => ({
  Page: ({ children }: { children: React.ReactNode }) => <div data-testid="page">{children}</div>,
}));

jest.mock('../../components/LoadingScreen', () => ({
  LoadingScreen: () => <div data-testid="loading-screen">Loading...</div>,
}));

jest.mock('../../pages/ErrorPage', () => ({
  __esModule: true,
  default: ({ error }: { error: string | Error }) => (
    <div data-testid="error-page">
      {typeof error === 'string' ? error : error.message}
    </div>
  ),
}));

jest.mock('../../components/Avatar', () => ({
  __esModule: true,
  default: ({ email, name, size }: { email: string; name: string; size: number }) => (
    <div data-testid="avatar" data-email={email} data-name={name} data-size={size}>
      Avatar
    </div>
  ),
}));

jest.mock('../../components/FollowButton', () => ({
  __esModule: true,
  default: ({ targetUserId, targetUserName }: { targetUserId: string; targetUserName: string }) => (
    <button data-testid="follow-button" data-target-user-id={targetUserId} data-target-user-name={targetUserName}>
      Follow
    </button>
  ),
}));

jest.mock('../../components/FollowersList', () => ({
  __esModule: true,
  default: ({ followers }: { followers: Array<{ id: string; name: string }> }) => (
    <div data-testid="followers-list">
      {followers.map(follower => (
        <div key={follower.id} data-testid={`follower-${follower.id}`}>
          {follower.name}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../../components/FollowingList', () => ({
  __esModule: true,
  default: ({ following }: { following: Array<{ id: string; name: string }> }) => (
    <div data-testid="following-list">
      {following.map(user => (
        <div key={user.id} data-testid={`following-${user.id}`}>
          {user.name}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../../components/UserRestaurantList', () => ({
  __esModule: true,
  default: ({ restaurants, onRestaurantClick }: { restaurants: Array<{ id: string; name: string; visits: number }>; onRestaurantClick: (id: string) => void }) => (
    <div data-testid="user-restaurant-list">
      {restaurants.map(restaurant => (
        <div
          key={restaurant.id}
          data-testid={`restaurant-${restaurant.id}`}
          onClick={() => onRestaurantClick(restaurant.id)}
        >
          {restaurant.name} ({restaurant.visits} visits)
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../../components/VisitModalReadOnly', () => ({
  __esModule: true,
  default: ({ show, onHide, visitData, restaurantName }: { show: boolean; onHide: () => void; visitData: { date: string; rating: number; comment: string } | null; restaurantName: string }) => (
    show && visitData ? (
      <div data-testid="visit-modal-readonly">
        <div data-testid="modal-restaurant-name">{restaurantName}</div>
        <div data-testid="modal-visit-date">{visitData.date}</div>
        <div data-testid="modal-visit-rating">{visitData.rating}</div>
        <div data-testid="modal-visit-comment">{visitData.comment}</div>
        <button onClick={onHide}>Close</button>
      </div>
    ) : null
  ),
}));

jest.mock('../../api/restaurantService', () => ({
  getRestaurantById: jest.fn(),
}));

const mockedUseAuth = jest.mocked(useAuth);
const mockedUseNavigate = jest.mocked(useNavigate);
const mockedUseParams = jest.mocked(useParams);
const mockedUseQuery = jest.mocked(useQuery);

describe('Profile', () => {
  const mockNavigate = jest.fn();
  
  const mockUser: User = {
    id: MOCK_USER_ID,
    name: MOCK_USER_NAME,
    email: MOCK_USER_EMAIL,
    rating: MOCK_USER_RATING,
    followers: MOCK_FOLLOWERS,
    following: MOCK_FOLLOWING,
  };


  beforeEach(() => {
    jest.clearAllMocks();
    
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      userId: MOCK_CURRENT_USER_ID,
      token: MOCK_TOKEN,
      storeUserId: jest.fn(),
      storeToken: jest.fn(),
      logout: jest.fn() as unknown as ReturnType<typeof useAuth>['logout'],
    });

    mockedUseNavigate.mockReturnValue(mockNavigate);
    
    mockedUseParams.mockReturnValue({ id: MOCK_USER_ID });
  });

  describe('Loading and Error States', () => {
    it('should display loading screen when user data is loading', () => {
      mockedUseQuery
        .mockReturnValueOnce({
          data: undefined,
          isLoading: true,
          isError: false,
          error: null,
          refetch: jest.fn(),
        } as never)
        .mockReturnValueOnce({
          data: [],
          isLoading: false,
          isError: false,
          error: null,
        } as never);

      render(<Profile />);

      expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
    });

    it('should display loading screen when visits data is loading', () => {
      mockedUseQuery
        .mockReturnValueOnce({
          data: mockUser,
          isLoading: false,
          isError: false,
          error: null,
        } as never)
        .mockReturnValueOnce({
          data: undefined,
          isLoading: true,
          isError: false,
          error: null,
        } as never);

      render(<Profile />);

      expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
    });

    it('should display error page when user query fails', () => {
      const mockError = new Error('Failed to fetch user');
      const mockRefetch = jest.fn();

      mockedUseQuery
        .mockReturnValueOnce({
          data: undefined,
          isLoading: false,
          isError: true,
          error: mockError,
          refetch: mockRefetch,
        } as never)
        .mockReturnValueOnce({
          data: [],
          isLoading: false,
          isError: false,
          error: null,
        } as never);

      render(<Profile />);

      expect(screen.getByTestId('error-page')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch user')).toBeInTheDocument();
    });

    it('should display error page when user is not found', () => {
      mockedUseQuery
        .mockReturnValueOnce({
          data: undefined,
          isLoading: false,
          isError: false,
          error: null,
        } as never)
        .mockReturnValueOnce({
          data: [],
          isLoading: false,
          isError: false,
          error: null,
        } as never);

      render(<Profile />);

      expect(screen.getByTestId('error-page')).toBeInTheDocument();
      expect(screen.getByText('social.userNotFound')).toBeInTheDocument();
    });
  });

  describe('User Profile Display', () => {
    beforeEach(() => {
      mockedUseQuery
        .mockReturnValueOnce({
          data: mockUser,
          isLoading: false,
          isError: false,
          error: null,
        } as never)
        .mockReturnValueOnce({
          data: [],
          isLoading: false,
          isError: false,
          error: null,
        } as never);
    });

    it('should render user profile with correct information', () => {
      render(<Profile />);

      expect(screen.getByText(MOCK_USER_NAME)).toBeInTheDocument();
      expect(screen.getByText(MOCK_USER_EMAIL)).toBeInTheDocument();
      expect(screen.getByText(MOCK_USER_RATING.toString())).toBeInTheDocument();
    });

    it('should render avatar component with correct props', () => {
      render(<Profile />);

      const avatar = screen.getByTestId('avatar');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('data-email', MOCK_USER_EMAIL);
      expect(avatar).toHaveAttribute('data-name', MOCK_USER_NAME);
      expect(avatar).toHaveAttribute('data-size', '100');
    });

    it('should display followers count', () => {
      render(<Profile />);

      expect(screen.getByText(MOCK_FOLLOWERS.length.toString())).toBeInTheDocument();
    });

    it('should display following count', () => {
      render(<Profile />);

      expect(screen.getByText(MOCK_FOLLOWING.length.toString())).toBeInTheDocument();
    });

    it('should render follow button with correct props', () => {
      render(<Profile />);

      const followButton = screen.getByTestId('follow-button');
      expect(followButton).toBeInTheDocument();
      expect(followButton).toHaveAttribute('data-target-user-id', MOCK_USER_ID);
      expect(followButton).toHaveAttribute('data-target-user-name', MOCK_USER_NAME);
    });
  });

  describe('Followers and Following Lists', () => {
    beforeEach(() => {
      mockedUseQuery
        .mockReturnValueOnce({
          data: mockUser,
          isLoading: false,
          isError: false,
          error: null,
        } as never)
        .mockReturnValueOnce({
          data: [],
          isLoading: false,
          isError: false,
          error: null,
        } as never);
    });

    it('should render followers list', () => {
      render(<Profile />);

      const followersList = screen.getByTestId('followers-list');
      expect(followersList).toBeInTheDocument();
    });

    it('should display all followers', () => {
      render(<Profile />);

      MOCK_FOLLOWERS.forEach(follower => {
        expect(screen.getByTestId(`follower-${follower.id}`)).toBeInTheDocument();
        expect(screen.getByText(follower.name)).toBeInTheDocument();
      });
    });

    it('should render following list when following tab is selected', async () => {
      render(<Profile />);

      await waitFor(() => {
        expect(screen.getByTestId('following-list')).toBeInTheDocument();
      });
    });

    it('should display all following users', async () => {
      render(<Profile />);

      await waitFor(() => {
        MOCK_FOLLOWING.forEach(user => {
          expect(screen.getByTestId(`following-${user.id}`)).toBeInTheDocument();
        });
      });
    });
  });

  describe('No Visits Display', () => {
    beforeEach(() => {
      mockedUseQuery
        .mockReturnValueOnce({
          data: mockUser,
          isLoading: false,
          isError: false,
          error: null,
        } as never)
        .mockReturnValueOnce({
          data: [],
          isLoading: false,
          isError: false,
          error: null,
        } as never);
    });

    it('should display no visits message when user has no visits', () => {
      render(<Profile />);

      expect(screen.getByText('userProfile.noVisits')).toBeInTheDocument();
    });

    it('should not render restaurant list when there are no visits', () => {
      render(<Profile />);

      expect(screen.queryByTestId('user-restaurant-list')).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should redirect to own profile when viewing own profile', () => {
      mockedUseAuth.mockReturnValue({
        isAuthenticated: true,
        userId: MOCK_USER_ID,
        token: MOCK_TOKEN,
        storeUserId: jest.fn(),
        storeToken: jest.fn(),
        logout: jest.fn() as unknown as ReturnType<typeof useAuth>['logout'],
      });

      mockedUseParams.mockReturnValue({ id: MOCK_USER_ID });

      mockedUseQuery
        .mockReturnValueOnce({
          data: mockUser,
          isLoading: false,
          isError: false,
          error: null,
        } as never)
        .mockReturnValueOnce({
          data: [],
          isLoading: false,
          isError: false,
          error: null,
        } as never);

      render(<Profile />);

      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  describe('Empty State Handling', () => {
    it('should handle user with no followers gracefully', () => {
      const userWithNoFollowers = {
        ...mockUser,
        followers: [],
      };

      mockedUseQuery
        .mockReturnValueOnce({
          data: userWithNoFollowers,
          isLoading: false,
          isError: false,
          error: null,
        } as never)
        .mockReturnValueOnce({
          data: [],
          isLoading: false,
          isError: false,
          error: null,
        } as never);

      render(<Profile />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle user with no following gracefully', () => {
      const userWithNoFollowing = {
        ...mockUser,
        following: [],
      };

      mockedUseQuery
        .mockReturnValueOnce({
          data: userWithNoFollowing,
          isLoading: false,
          isError: false,
          error: null,
        } as never)
        .mockReturnValueOnce({
          data: [],
          isLoading: false,
          isError: false,
          error: null,
        } as never);

      render(<Profile />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });
});

