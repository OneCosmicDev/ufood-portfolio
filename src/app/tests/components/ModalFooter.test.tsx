import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ModalFooter from '../../components/ModalFooter';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'confirm': 'Confirm',
                'cancel': 'Cancel',
                'loading': 'Loading...',
            };
            return translations[key] || key;
        },
    }),
}));

describe('ModalFooter', () => {
    const mockOnCancel = jest.fn();
    const mockOnConfirm = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders cancel and confirm buttons with default text', () => {
        render(<ModalFooter onCancel={mockOnCancel} onConfirm={mockOnConfirm} />);

        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    test('renders custom button text', () => {
        render(
            <ModalFooter 
                onCancel={mockOnCancel} 
                onConfirm={mockOnConfirm}
                confirmText="Save"
                cancelText="Discard"
            />
        );

        expect(screen.getByText('Save')).toBeInTheDocument();
        expect(screen.getByText('Discard')).toBeInTheDocument();
    });

    test('calls onCancel when cancel button is clicked', () => {
        render(<ModalFooter onCancel={mockOnCancel} onConfirm={mockOnConfirm} />);

        fireEvent.click(screen.getByText('Cancel'));

        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    test('calls onConfirm when confirm button is clicked', () => {
        render(<ModalFooter onCancel={mockOnCancel} onConfirm={mockOnConfirm} />);

        fireEvent.click(screen.getByText('Confirm'));

        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    test('shows loading text when isLoading is true', () => {
        render(
            <ModalFooter 
                onCancel={mockOnCancel} 
                onConfirm={mockOnConfirm}
                isLoading={true}
            />
        );

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('disables both buttons when isLoading is true', () => {
        render(
            <ModalFooter 
                onCancel={mockOnCancel} 
                onConfirm={mockOnConfirm}
                isLoading={true}
            />
        );

        expect(screen.getByText('Cancel')).toBeDisabled();
        expect(screen.getByText('Loading...')).toBeDisabled();
    });

    test('disables confirm button when isConfirmDisabled is true', () => {
        render(
            <ModalFooter 
                onCancel={mockOnCancel} 
                onConfirm={mockOnConfirm}
                isConfirmDisabled={true}
            />
        );

        expect(screen.getByText('Confirm')).toBeDisabled();
        expect(screen.getByText('Cancel')).not.toBeDisabled();
    });

    test('renders with success variant by default for confirm button', () => {
        render(<ModalFooter onCancel={mockOnCancel} onConfirm={mockOnConfirm} />);

        const confirmButton = screen.getByText('Confirm');
        expect(confirmButton).toHaveClass('btn-success');
    });

    test('renders with secondary variant by default for cancel button', () => {
        render(<ModalFooter onCancel={mockOnCancel} onConfirm={mockOnConfirm} />);

        const cancelButton = screen.getByText('Cancel');
        expect(cancelButton).toHaveClass('btn-secondary');
    });

    test('renders with custom variants', () => {
        render(
            <ModalFooter 
                onCancel={mockOnCancel} 
                onConfirm={mockOnConfirm}
                confirmVariant="danger"
                cancelVariant="primary"
            />
        );

        expect(screen.getByText('Confirm')).toHaveClass('btn-danger');
        expect(screen.getByText('Cancel')).toHaveClass('btn-primary');
    });

    test('renders with small size by default', () => {
        render(<ModalFooter onCancel={mockOnCancel} onConfirm={mockOnConfirm} />);

        expect(screen.getByText('Confirm')).toHaveClass('btn-sm');
        expect(screen.getByText('Cancel')).toHaveClass('btn-sm');
    });

    test('renders with large size when specified', () => {
        render(
            <ModalFooter 
                onCancel={mockOnCancel} 
                onConfirm={mockOnConfirm}
                size="lg"
            />
        );

        expect(screen.getByText('Confirm')).toHaveClass('btn-lg');
        expect(screen.getByText('Cancel')).toHaveClass('btn-lg');
    });
});
