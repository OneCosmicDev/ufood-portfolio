import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from '../../components/ConfirmDialog';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'confirm': 'Confirm',
                'cancel': 'Cancel',
            };
            return translations[key] || key;
        },
    }),
}));

describe('ConfirmDialog', () => {
    const mockOnHide = jest.fn();
    const mockOnConfirm = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders dialog when show is true', () => {
        render(
            <ConfirmDialog
                show={true}
                onHide={mockOnHide}
                onConfirm={mockOnConfirm}
                title="Delete Item"
                message="Are you sure you want to delete this item?"
            />
        );

        expect(screen.getByText('Delete Item')).toBeInTheDocument();
        expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
    });

    test('does not render dialog when show is false', () => {
        render(
            <ConfirmDialog
                show={false}
                onHide={mockOnHide}
                onConfirm={mockOnConfirm}
                title="Delete Item"
                message="Are you sure?"
            />
        );

        expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
    });

    test('renders default confirm and cancel buttons', () => {
        render(
            <ConfirmDialog
                show={true}
                onHide={mockOnHide}
                onConfirm={mockOnConfirm}
                title="Test"
                message="Test message"
            />
        );

        expect(screen.getByText('Confirm')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    test('renders custom confirm and cancel text', () => {
        render(
            <ConfirmDialog
                show={true}
                onHide={mockOnHide}
                onConfirm={mockOnConfirm}
                title="Test"
                message="Test message"
                confirmText="Yes, delete"
                cancelText="No, keep it"
            />
        );

        expect(screen.getByText('Yes, delete')).toBeInTheDocument();
        expect(screen.getByText('No, keep it')).toBeInTheDocument();
    });

    test('calls onConfirm and onHide when confirm button is clicked', () => {
        render(
            <ConfirmDialog
                show={true}
                onHide={mockOnHide}
                onConfirm={mockOnConfirm}
                title="Test"
                message="Test message"
            />
        );

        fireEvent.click(screen.getByText('Confirm'));

        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
        expect(mockOnHide).toHaveBeenCalledTimes(1);
    });

    test('calls onHide when cancel button is clicked', () => {
        render(
            <ConfirmDialog
                show={true}
                onHide={mockOnHide}
                onConfirm={mockOnConfirm}
                title="Test"
                message="Test message"
            />
        );

        fireEvent.click(screen.getByText('Cancel'));

        expect(mockOnHide).toHaveBeenCalledTimes(1);
        expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    test('displays the correct message', () => {
        render(
            <ConfirmDialog
                show={true}
                onHide={mockOnHide}
                onConfirm={mockOnConfirm}
                title="Warning"
                message="This action cannot be undone."
            />
        );

        expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
    });
});
