import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FavoriteListForm from '../../../components/favorites/FavoriteListForm';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'favorites.form.placeholder': 'Enter list name',
                'favorites.form.create': 'Create',
                'favorites.form.creating': 'Creating...',
                'favorites.form.nameRequired': 'Name is required',
                'favorites.form.nameTooShort': 'Name must be at least 3 characters',
                'favorites.form.nameAlreadyExists': 'A list with this name already exists',
            };
            return translations[key] || key;
        },
    }),
}));

describe('FavoriteListForm', () => {
    const mockOnSubmit = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders form with input and button', () => {
        render(<FavoriteListForm onSubmit={mockOnSubmit} />);

        expect(screen.getByPlaceholderText('Enter list name')).toBeInTheDocument();
        expect(screen.getByText('Create')).toBeInTheDocument();
    });

    test('shows validation error when submitting empty name', () => {
        render(<FavoriteListForm onSubmit={mockOnSubmit} />);

        fireEvent.click(screen.getByText('Create'));

        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test('shows validation error when name is too short', () => {
        render(<FavoriteListForm onSubmit={mockOnSubmit} />);

        const input = screen.getByPlaceholderText('Enter list name');
        fireEvent.change(input, { target: { value: 'ab' } });
        fireEvent.click(screen.getByText('Create'));

        expect(screen.getByText('Name must be at least 3 characters')).toBeInTheDocument();
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test('shows validation error when name already exists', () => {
        render(
            <FavoriteListForm 
                onSubmit={mockOnSubmit} 
                existingNames={['my list', 'favorites']} 
            />
        );

        const input = screen.getByPlaceholderText('Enter list name');
        fireEvent.change(input, { target: { value: 'My List' } });
        fireEvent.click(screen.getByText('Create'));

        expect(screen.getByText('A list with this name already exists')).toBeInTheDocument();
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test('calls onSubmit with trimmed name when valid', () => {
        render(<FavoriteListForm onSubmit={mockOnSubmit} />);

        const input = screen.getByPlaceholderText('Enter list name');
        fireEvent.change(input, { target: { value: '  My Favorites  ' } });
        fireEvent.click(screen.getByText('Create'));

        expect(mockOnSubmit).toHaveBeenCalledWith('My Favorites');
    });

    test('clears input after successful submit', () => {
        render(<FavoriteListForm onSubmit={mockOnSubmit} />);

        const input = screen.getByPlaceholderText('Enter list name');
        fireEvent.change(input, { target: { value: 'New List' } });
        fireEvent.click(screen.getByText('Create'));

        expect((input as HTMLInputElement).value).toBe('');
    });

    test('shows loading state when isLoading is true', () => {
        render(<FavoriteListForm onSubmit={mockOnSubmit} isLoading={true} />);

        expect(screen.getByText('Creating...')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter list name')).toBeDisabled();
    });

    test('disables button when isLoading is true', () => {
        render(<FavoriteListForm onSubmit={mockOnSubmit} isLoading={true} />);

        expect(screen.getByText('Creating...')).toBeDisabled();
    });

    test('displays error message when error prop is provided', () => {
        render(<FavoriteListForm onSubmit={mockOnSubmit} error="Server error occurred" />);

        expect(screen.getByText('Server error occurred')).toBeInTheDocument();
    });

    test('updates input value on change', () => {
        render(<FavoriteListForm onSubmit={mockOnSubmit} />);

        const input = screen.getByPlaceholderText('Enter list name');
        fireEvent.change(input, { target: { value: 'Test List' } });

        expect((input as HTMLInputElement).value).toBe('Test List');
    });
});
