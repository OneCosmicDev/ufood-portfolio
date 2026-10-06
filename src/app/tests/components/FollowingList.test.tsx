import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FollowingList from '../../components/FollowingList';
import Follower from '../../types/Follower';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            if (key === 'social.following') return 'Following';
            if (key === 'social.noFollowing') return 'No following';
            if (key === 'social.moreFollowing') return 'more';
            return key;
        },
    }),
}));

const mockFollowing: Follower[] = [
    {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
    },
    {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
    },
    {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
    },
];

const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('FollowingList', () => {
    test('renders empty state when following is empty', () => {
        renderWithRouter(<FollowingList following={[]} />);
        expect(screen.getByText('No following')).toBeInTheDocument();
    });

    test('renders empty state when following is undefined', () => {
        renderWithRouter(<FollowingList />);
        expect(screen.getByText('No following')).toBeInTheDocument();
    });

    test('renders list of following users', () => {
        renderWithRouter(<FollowingList following={mockFollowing} />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    test('displays count badge when showCount is true', () => {
        renderWithRouter(<FollowingList following={mockFollowing} showCount={true} />);
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    test('hides count badge when showCount is false', () => {
        renderWithRouter(<FollowingList following={mockFollowing} showCount={false} />);
        expect(screen.queryByText('3')).not.toBeInTheDocument();
    });

    test('limits displayed users when maxVisible is set', () => {
        renderWithRouter(<FollowingList following={mockFollowing} maxVisible={2} />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
        expect(screen.getByText(/\+1.*more/)).toBeInTheDocument();
    });

    test('uses custom title when provided', () => {
        renderWithRouter(<FollowingList following={[]} title="Custom Title" />);
        expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    test('uses custom empty message when provided', () => {
        renderWithRouter(<FollowingList following={[]} emptyMessage="No users found" />);
        expect(screen.getByText('No users found')).toBeInTheDocument();
    });

    test('renders correct number of user items', () => {
        renderWithRouter(<FollowingList following={mockFollowing} />);
        const listItems = screen.getAllByRole('link');
        expect(listItems.length).toBeGreaterThanOrEqual(3);
    });

    test('displays user email for each follower', () => {
        renderWithRouter(<FollowingList following={mockFollowing} />);
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
        expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    });
});
