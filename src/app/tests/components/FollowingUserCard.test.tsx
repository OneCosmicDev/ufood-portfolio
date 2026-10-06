import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FollowingUserCard from '../../components/FollowingUserCard';
import User from '../../types/User';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: { score: number }) => {
            if (key === 'userProfile.score_text_one') return `${options?.score} point`;
            if (key === 'userProfile.score_text_multiple') return `${options?.score} points`;
            return key;
        },
    }),
}));

const createMockUser = (overrides: Partial<User> = {}): User => ({
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    rating: 5,
    following: [],
    followers: [],
    ...overrides,
});

describe('FollowingUserCard', () => {
    test('renders user name', () => {
        const user = createMockUser({ name: 'Alice Smith' });
        const onClick = jest.fn();

        render(<FollowingUserCard user={user} onClick={onClick} />);

        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    test('renders user rating with plural text when rating > 0', () => {
        const user = createMockUser({ rating: 10 });
        const onClick = jest.fn();

        render(<FollowingUserCard user={user} onClick={onClick} />);

        expect(screen.getByText('10 points')).toBeInTheDocument();
    });

    test('renders user rating with singular text when rating <= 0', () => {
        const user = createMockUser({ rating: 0 });
        const onClick = jest.fn();

        render(<FollowingUserCard user={user} onClick={onClick} />);

        expect(screen.getByText('0 point')).toBeInTheDocument();
    });

    test('calls onClick with user id when card is clicked', () => {
        const user = createMockUser({ id: 'user-456' });
        const onClick = jest.fn();

        render(<FollowingUserCard user={user} onClick={onClick} />);

        const card = screen.getByText('John Doe').closest('.card');
        fireEvent.click(card!);

        expect(onClick).toHaveBeenCalledTimes(1);
        expect(onClick).toHaveBeenCalledWith('user-456');
    });

    test('renders user icon', () => {
        const user = createMockUser();
        const onClick = jest.fn();

        render(<FollowingUserCard user={user} onClick={onClick} />);

        const icon = document.querySelector('.fa-user');
        expect(icon).toBeInTheDocument();
    });

    test('renders star icon for rating', () => {
        const user = createMockUser();
        const onClick = jest.fn();

        render(<FollowingUserCard user={user} onClick={onClick} />);

        const starIcon = document.querySelector('.fa-star');
        expect(starIcon).toBeInTheDocument();
    });
});
