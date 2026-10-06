import React from 'react';
import { ListGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserFriends } from '@fortawesome/free-solid-svg-icons';
import Avatar from './Avatar';
import Follower from '../types/Follower';
import { RoutesPath } from '../RoutesPath';

interface FollowingListProps {
    following?: Follower[];
    title?: string;
    emptyMessage?: string;
    showCount?: boolean;
    maxVisible?: number;
    className?: string;
}

const FollowingList: React.FC<FollowingListProps> = ({
    following = [],
    title,
    emptyMessage,
    showCount = true,
    maxVisible,
    className = '',
}) => {
    const { t } = useTranslation();

    const displayTitle = title ?? t('social.following');
    const displayEmptyMessage = emptyMessage ?? t('social.noFollowing');

    const usersToDisplay = maxVisible ? following.slice(0, maxVisible) : following;

    const remainingCount = maxVisible && following.length > maxVisible 
        ? following.length - maxVisible 
        : 0;

    return (
        <div className={className}>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0 d-flex align-items-center gap-2">
                    <FontAwesomeIcon icon={faUserFriends} className="text-muted" />
                    {displayTitle}
                </h5>
                {showCount && (
                    <Badge bg="secondary" pill>
                        {following.length}
                    </Badge>
                )}
            </div>

            {following.length === 0 ? (
                <p className="text-muted text-center py-3">{displayEmptyMessage}</p>
            ) : (
                <ListGroup variant="flush">
                    {usersToDisplay.map((user) => (
                        <ListGroup.Item
                            key={user.id}
                            as={Link}
                            to={RoutesPath.USER_PROFILE.replace(':id', user.id)}
                            action
                            className="d-flex align-items-center gap-3 py-3"
                        >
                            <Avatar
                                email={user.email}
                                name={user.name}
                                size={40}
                            />
                            <div className="flex-grow-1">
                                <div className="fw-semibold">{user.name}</div>
                                <small className="text-muted">{user.email}</small>
                            </div>
                        </ListGroup.Item>
                    ))}
                    {remainingCount > 0 && (
                        <ListGroup.Item className="text-center text-muted py-2">
                            +{remainingCount} {t('social.moreFollowing', { defaultValue: 'more' })}
                        </ListGroup.Item>
                    )}
                </ListGroup>
            )}
        </div>
    );
};

export default FollowingList;
