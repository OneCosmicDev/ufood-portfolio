import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../../components/Footer';

describe('Footer', () => {
    test('renders footer text', () => {
        render(<Footer />);

        expect(screen.getByText('footer_text')).toBeInTheDocument();
    });
});
