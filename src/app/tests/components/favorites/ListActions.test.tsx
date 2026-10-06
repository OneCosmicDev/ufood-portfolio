import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ListActions from '../../../components/favorites/ListActions';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'favorites.rename': 'Rename',
                'favorites.addRestaurant': 'Add restaurant',
                'favorites.delete': 'Delete',
            };
            return translations[key] || key;
        },
    }),
}));

describe('ListActions', () => {
    const mockOnEdit = jest.fn();
    const mockOnAddRestaurant = jest.fn();
    const mockOnDelete = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders all three action buttons', () => {
        render(
            <ListActions 
                onEdit={mockOnEdit} 
                onAddRestaurant={mockOnAddRestaurant} 
                onDelete={mockOnDelete} 
            />
        );

        expect(screen.getByText('Rename')).toBeInTheDocument();
        expect(screen.getByText('Add restaurant')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    test('calls onEdit when rename button is clicked', () => {
        render(
            <ListActions 
                onEdit={mockOnEdit} 
                onAddRestaurant={mockOnAddRestaurant} 
                onDelete={mockOnDelete} 
            />
        );

        fireEvent.click(screen.getByText('Rename'));
        expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    test('calls onAddRestaurant when add button is clicked', () => {
        render(
            <ListActions 
                onEdit={mockOnEdit} 
                onAddRestaurant={mockOnAddRestaurant} 
                onDelete={mockOnDelete} 
            />
        );

        fireEvent.click(screen.getByText('Add restaurant'));
        expect(mockOnAddRestaurant).toHaveBeenCalledTimes(1);
    });

    test('calls onDelete when delete button is clicked', () => {
        render(
            <ListActions 
                onEdit={mockOnEdit} 
                onAddRestaurant={mockOnAddRestaurant} 
                onDelete={mockOnDelete} 
            />
        );

        fireEvent.click(screen.getByText('Delete'));
        expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    test('renders edit icon', () => {
        render(
            <ListActions 
                onEdit={mockOnEdit} 
                onAddRestaurant={mockOnAddRestaurant} 
                onDelete={mockOnDelete} 
            />
        );

        expect(document.querySelector('.fa-pen-to-square')).toBeInTheDocument();
    });

    test('renders plus icon', () => {
        render(
            <ListActions 
                onEdit={mockOnEdit} 
                onAddRestaurant={mockOnAddRestaurant} 
                onDelete={mockOnDelete} 
            />
        );

        expect(document.querySelector('.fa-plus')).toBeInTheDocument();
    });

    test('renders trash icon', () => {
        render(
            <ListActions 
                onEdit={mockOnEdit} 
                onAddRestaurant={mockOnAddRestaurant} 
                onDelete={mockOnDelete} 
            />
        );

        expect(document.querySelector('.fa-trash')).toBeInTheDocument();
    });
});
