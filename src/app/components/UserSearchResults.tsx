import React from 'react';
import { ListGroup, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUser } from '@fortawesome/free-solid-svg-icons';
import User from '../types/User';
import Avatar from './Avatar';
import { RoutesPath } from '../RoutesPath';

interface UserSearchResultsProps {
    users: User[];
    isLoading: boolean;
    isError?: boolean;
    error?: Error | null;
    searchQuery: string;
    onUserClick?: (user: User) => void;
    maxResults?: number;
    className?: string;
    showEmptyState?: boolean;
}

const UserSearchResults: React.FC<UserSearchResultsProps> = ({
    users,
    isLoading,
    isError = false,
    error: _error,
    searchQuery,
    onUserClick,
    maxResults,
    className = '',
    showEmptyState = true,
}) => {
    const { t } = useTranslation();

    const displayedUsers = maxResults ? users.slice(0, maxResults) : users;
    const remainingCount = maxResults && users.length > maxResults 
        ? users.length - maxResults 
        : 0;

    if (isLoading) {
        return (
            <div className={`text-center py-4 ${className}`}>
                <Spinner animation="border" size="sm" role="status">
                    <span className="visually-hidden">{t('loading')}</span>
                </Spinner>
                <p className="text-muted mt-2 mb-0">{t('social.searchingUsers', { defaultValue: 'Searching users...' })}</p>
            </div>
        );
    }

    if (isError) {
        return (
            <Alert variant="danger" className={className}>
                {t('social.searchError', { defaultValue: 'Error searching users' })}
            </Alert>
        );
    }

    if (showEmptyState && searchQuery.trim() && users.length === 0) {
        return (
            <div className={`text-center py-4 ${className}`}>
                <FontAwesomeIcon icon={faSearch} size="2x" className="text-muted mb-3" />
                <p className="text-muted mb-0">
                    {t('social.noUsersFound', { defaultValue: 'No users found for "{{query}}"', query: searchQuery })}
                </p>
            </div>
        );
    }

    if (!searchQuery.trim()) {
        return null;
    }

    const renderUserItem = (user: User) => {
        const content = (
            <>
                <Avatar
                    email={user.email}
                    name={user.name}
                    size={40}
                />
                <div className="flex-grow-1 text-start">
                    <div className="fw-semibold">{user.name}</div>
                    <small className="text-muted">{user.email}</small>
                </div>
                <FontAwesomeIcon icon={faUser} className="text-muted" />
            </>
        );

        if (onUserClick) {
            return (
                <ListGroup.Item
                    key={user.id}
                    as="button"
                    onClick={() => onUserClick(user)}
                    action
                    className="d-flex align-items-center gap-3 py-3"
                >
                    {content}
                </ListGroup.Item>
            );
        }

        return (
            <ListGroup.Item
                key={user.id}
                as={Link}
                to={RoutesPath.USER_PROFILE.replace(':id', user.id)}
                action
                className="d-flex align-items-center gap-3 py-3"
            >
                {content}
            </ListGroup.Item>
        );
    };

    return (
        <div className={className}>
            <ListGroup variant="flush">
                {displayedUsers.map((user) => renderUserItem(user))}
                {remainingCount > 0 && (
                    <ListGroup.Item className="text-center text-muted py-2">
                        +{remainingCount} {t('social.moreResults', { defaultValue: 'more results' })}
                    </ListGroup.Item>
                )}
            </ListGroup>
        </div>
    );
};

export default UserSearchResults;
