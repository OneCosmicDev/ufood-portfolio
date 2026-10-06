import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FavoriteListCard from '../../../components/favorites/FavoriteListCard';
import { FavoriteList } from '../../../types/FavoriteList';
import Restaurant from '../../../types/Restaurant';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: Record<string, string>) => {
            const translations: Record<string, string> = {
                'favorites.rename': 'Rename',
                'favorites.addRestaurant': 'Add restaurant',
                'favorites.delete': 'Delete',
                'favorites.save': 'Save',
                'favorites.cancel': 'Cancel',
                'favorites.noRestaurants': 'No restaurants in this list',
                'favorites.addFirstRestaurant': 'Add your first restaurant',
                'favorites.deleteListTitle': 'Delete List',
                'favorites.confirmDelete': `Are you sure you want to delete ${options?.name || ''}?`,
                'favorites.removeRestaurantTitle': 'Remove Restaurant',
                'favorites.confirmRemoveRestaurant': `Remove ${options?.name || ''} from list?`,
                'favorites.form.nameRequired': 'Name is required',
                'favorites.form.nameTooShort': 'Name must be at least 3 characters',
                'favorites.form.nameAlreadyExists': 'A list with this name already exists',
                'favorites.readOnly': 'Read-only: this list does not belong to you.',
                'favorites.unauthorized': 'You are not authorized to perform this action on this list.',
                'confirm': 'Confirm',
                'cancel': 'Cancel',
            };
            return translations[key] || key;
        },
    }),
    withTranslation: () => (Component: any) => (props: any) => (
        <Component {...props} t={(key: string) => key} i18n={{ language: 'en' }} />
    ),
}));

const createMockRestaurant = (overrides: Partial<Restaurant> = {}): Restaurant => ({
    id: 'rest-123',
    name: 'Test Restaurant',
    genres: ['Italian'],
    address: '123 Test St',
    location: { type: 'Point', coordinates: [-73.5, 45.5] },
    ...overrides,
});

const createMockFavoriteList = (overrides: Partial<FavoriteList> = {}): FavoriteList => ({
    id: 'list-123',
    name: 'My Favorites',
    owner: 'user-123',
    restaurants: [],
    ...overrides,
});

const renderWithRouter = (component: React.ReactElement) => {
    return render(
        <MemoryRouter>
            {component}
        </MemoryRouter>
    );
};

describe('FavoriteListCard', () => {
    const mockOnUpdate = jest.fn();
    const mockOnDelete = jest.fn();
    const mockOnRemoveRestaurant = jest.fn();
    const mockOnAddRestaurant = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders list name', () => {
        const list = createMockFavoriteList({ name: 'Best Restaurants' });

        renderWithRouter(
            <FavoriteListCard
                list={list}
                isOwner={true}
                onUpdate={mockOnUpdate}
                onDelete={mockOnDelete}
                onRemoveRestaurant={mockOnRemoveRestaurant}
                onAddRestaurant={mockOnAddRestaurant}
            />
        );

        expect(screen.getByText('Best Restaurants')).toBeInTheDocument();
    });

    test('renders action buttons', () => {
        const list = createMockFavoriteList();

        renderWithRouter(
            <FavoriteListCard
                list={list}
                isOwner={true}
                onUpdate={mockOnUpdate}
                onDelete={mockOnDelete}
                onRemoveRestaurant={mockOnRemoveRestaurant}
                onAddRestaurant={mockOnAddRestaurant}
            />
        );

        expect(screen.getByText('Rename')).toBeInTheDocument();
        expect(screen.getByText('Add restaurant')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    test('shows empty state when no restaurants', () => {
        const list = createMockFavoriteList({ restaurants: [] });

        renderWithRouter(
            <FavoriteListCard
                list={list}
                isOwner={true}
                onUpdate={mockOnUpdate}
                onDelete={mockOnDelete}
                onRemoveRestaurant={mockOnRemoveRestaurant}
                onAddRestaurant={mockOnAddRestaurant}
            />
        );

        expect(screen.getByText('No restaurants in this list')).toBeInTheDocument();
        expect(screen.getByText('Add your first restaurant')).toBeInTheDocument();
    });

    test('renders restaurants when list has restaurants', () => {
        const restaurants = [
            createMockRestaurant({ id: '1', name: 'Pizza Place' }),
            createMockRestaurant({ id: '2', name: 'Sushi Bar' }),
        ];
        const list = createMockFavoriteList({ restaurants });

        renderWithRouter(
            <FavoriteListCard
                list={list}
                isOwner={true}
                onUpdate={mockOnUpdate}
                onDelete={mockOnDelete}
                onRemoveRestaurant={mockOnRemoveRestaurant}
                onAddRestaurant={mockOnAddRestaurant}
            />
        );

        expect(screen.getByText('Pizza Place')).toBeInTheDocument();
        expect(screen.getByText('Sushi Bar')).toBeInTheDocument();
    });

    test('enters edit mode when rename button is clicked', () => {
        const list = createMockFavoriteList({ name: 'My List' });

        renderWithRouter(
            <FavoriteListCard
                list={list}
                isOwner={true}
                onUpdate={mockOnUpdate}
                onDelete={mockOnDelete}
                onRemoveRestaurant={mockOnRemoveRestaurant}
                onAddRestaurant={mockOnAddRestaurant}
            />
        );

        fireEvent.click(screen.getByText('Rename'));

        expect(screen.getByDisplayValue('My List')).toBeInTheDocument();
        expect(screen.getByText('Save')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    test('calls onUpdate when saving new name', () => {
        const list = createMockFavoriteList({ id: 'list-1', name: 'Old Name' });

        renderWithRouter(
            <FavoriteListCard
                list={list}
                isOwner={true}
                onUpdate={mockOnUpdate}
                onDelete={mockOnDelete}
                onRemoveRestaurant={mockOnRemoveRestaurant}
                onAddRestaurant={mockOnAddRestaurant}
            />
        );

        fireEvent.click(screen.getByText('Rename'));
        
        const input = screen.getByDisplayValue('Old Name');
        fireEvent.change(input, { target: { value: 'New Name' } });
        fireEvent.click(screen.getByText('Save'));

        expect(mockOnUpdate).toHaveBeenCalledWith('list-1', 'New Name');
    });

    test('cancels edit mode and restores original name', () => {
        const list = createMockFavoriteList({ name: 'Original Name' });

        renderWithRouter(
            <FavoriteListCard
                list={list}
                isOwner={true}
                onUpdate={mockOnUpdate}
                onDelete={mockOnDelete}
                onRemoveRestaurant={mockOnRemoveRestaurant}
                onAddRestaurant={mockOnAddRestaurant}
            />
        );

        fireEvent.click(screen.getByText('Rename'));
        
        const input = screen.getByDisplayValue('Original Name');
        fireEvent.change(input, { target: { value: 'Changed Name' } });
        fireEvent.click(screen.getByText('Cancel'));

        expect(screen.getByText('Original Name')).toBeInTheDocument();
        expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    test('shows validation error for empty name', () => {
        const list = createMockFavoriteList({ name: 'My List' });

        renderWithRouter(
            <FavoriteListCard
                list={list}
                isOwner={true}
                onUpdate={mockOnUpdate}
                onDelete={mockOnDelete}
                onRemoveRestaurant={mockOnRemoveRestaurant}
                onAddRestaurant={mockOnAddRestaurant}
            />
        );

        fireEvent.click(screen.getByText('Rename'));
        
        const input = screen.getByDisplayValue('My List');
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.click(screen.getByText('Save'));

        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    test('shows validation error for name too short', () => {
        const list = createMockFavoriteList({ name: 'My List' });

        renderWithRouter(
            <FavoriteListCard
                list={list}
                isOwner={true}
                onUpdate={mockOnUpdate}
                onDelete={mockOnDelete}
                onRemoveRestaurant={mockOnRemoveRestaurant}
                onAddRestaurant={mockOnAddRestaurant}
            />
        );

        fireEvent.click(screen.getByText('Rename'));
        
        const input = screen.getByDisplayValue('My List');
        fireEvent.change(input, { target: { value: 'ab' } });
        fireEvent.click(screen.getByText('Save'));

        expect(screen.getByText('Name must be at least 3 characters')).toBeInTheDocument();
        expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    test('shows validation error for duplicate name', () => {
        const list = createMockFavoriteList({ name: 'My List' });

        renderWithRouter(
            <FavoriteListCard
                list={list}
                isOwner={true}
                onUpdate={mockOnUpdate}
                onDelete={mockOnDelete}
                onRemoveRestaurant={mockOnRemoveRestaurant}
                onAddRestaurant={mockOnAddRestaurant}
                existingNames={['other list', 'favorites']}
            />
        );

        fireEvent.click(screen.getByText('Rename'));
        
        const input = screen.getByDisplayValue('My List');
        fireEvent.change(input, { target: { value: 'Other List' } });
        fireEvent.click(screen.getByText('Save'));

        expect(screen.getByText('A list with this name already exists')).toBeInTheDocument();
        expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    test('calls onAddRestaurant when add button is clicked', () => {
        const list = createMockFavoriteList({ id: 'list-abc' });

        renderWithRouter(
            <FavoriteListCard
                list={list}
                isOwner={true}
                onUpdate={mockOnUpdate}
                onDelete={mockOnDelete}
                onRemoveRestaurant={mockOnRemoveRestaurant}
                onAddRestaurant={mockOnAddRestaurant}
            />
        );

        fireEvent.click(screen.getByText('Add restaurant'));

        expect(mockOnAddRestaurant).toHaveBeenCalledWith('list-abc');
    });

    test('calls onAddRestaurant when "Add your first restaurant" is clicked', () => {
        const list = createMockFavoriteList({ id: 'list-empty', restaurants: [] });

        renderWithRouter(
            <FavoriteListCard
                list={list}
                isOwner={true}
                onUpdate={mockOnUpdate}
                onDelete={mockOnDelete}
                onRemoveRestaurant={mockOnRemoveRestaurant}
                onAddRestaurant={mockOnAddRestaurant}
            />
        );

        fireEvent.click(screen.getByText('Add your first restaurant'));

        expect(mockOnAddRestaurant).toHaveBeenCalledWith('list-empty');
    });

    test('shows delete confirmation dialog when delete is clicked', () => {
        const list = createMockFavoriteList({ name: 'To Delete' });

        renderWithRouter(
            <FavoriteListCard
                list={list}
                isOwner={true}
                onUpdate={mockOnUpdate}
                onDelete={mockOnDelete}
                onRemoveRestaurant={mockOnRemoveRestaurant}
                onAddRestaurant={mockOnAddRestaurant}
            />
        );

        fireEvent.click(screen.getByText('Delete'));

        expect(screen.getByText('Delete List')).toBeInTheDocument();
        expect(screen.getByText('Are you sure you want to delete To Delete?')).toBeInTheDocument();
    });

    test('calls onDelete when delete is confirmed', () => {
        const list = createMockFavoriteList({ id: 'list-to-delete' });

        renderWithRouter(
            <FavoriteListCard
                list={list}
                isOwner={true}
                onUpdate={mockOnUpdate}
                onDelete={mockOnDelete}
                onRemoveRestaurant={mockOnRemoveRestaurant}
                onAddRestaurant={mockOnAddRestaurant}
            />
        );

        fireEvent.click(screen.getByText('Delete'));
        fireEvent.click(screen.getByText('Confirm'));

        expect(mockOnDelete).toHaveBeenCalledWith('list-to-delete');
    });

    test('hides action buttons when isOwner is false', () => {
        const list = createMockFavoriteList();

        renderWithRouter(
            <FavoriteListCard
                list={list}
                isOwner={false}
                onUpdate={mockOnUpdate}
                onDelete={mockOnDelete}
                onRemoveRestaurant={mockOnRemoveRestaurant}
                onAddRestaurant={mockOnAddRestaurant}
            />
        );

        expect(screen.queryByText('Rename')).not.toBeInTheDocument();
        expect(screen.queryByText('Add restaurant')).not.toBeInTheDocument();
        expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    test('shows read-only indicator when isOwner is false', () => {
        const list = createMockFavoriteList({ name: 'Shared List' });

        renderWithRouter(
            <FavoriteListCard
                list={list}
                isOwner={false}
                onUpdate={mockOnUpdate}
                onDelete={mockOnDelete}
                onRemoveRestaurant={mockOnRemoveRestaurant}
                onAddRestaurant={mockOnAddRestaurant}
            />
        );

        expect(screen.getByText('Shared List')).toBeInTheDocument();
        expect(screen.getByText('Read-only: this list does not belong to you.')).toBeInTheDocument();
    });

    test('hides delete button on restaurants when isOwner is false', () => {
        const restaurants = [
            createMockRestaurant({ id: '1', name: 'Pizza Place' }),
        ];
        const list = createMockFavoriteList({ restaurants });

        renderWithRouter(
            <FavoriteListCard
                list={list}
                isOwner={false}
                onUpdate={mockOnUpdate}
                onDelete={mockOnDelete}
                onRemoveRestaurant={mockOnRemoveRestaurant}
                onAddRestaurant={mockOnAddRestaurant}
            />
        );

        expect(screen.getByText('Pizza Place')).toBeInTheDocument();
        const deleteButtons = screen.queryAllByRole('button', { name: /trash/i });
        expect(deleteButtons.length).toBe(0);
    });

    test('hides "Add first restaurant" button when isOwner is false', () => {
        const list = createMockFavoriteList({ restaurants: [] });

        renderWithRouter(
            <FavoriteListCard
                list={list}
                isOwner={false}
                onUpdate={mockOnUpdate}
                onDelete={mockOnDelete}
                onRemoveRestaurant={mockOnRemoveRestaurant}
                onAddRestaurant={mockOnAddRestaurant}
            />
        );

        expect(screen.getByText('No restaurants in this list')).toBeInTheDocument();
        expect(screen.queryByText('Add your first restaurant')).not.toBeInTheDocument();
    });
});
