import React from 'react';
import { ListGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import Follower from '../types/Follower';
import Avatar from './Avatar';
import { RoutesPath } from '../RoutesPath';

interface FollowersListProps {
    followers?: Follower[];
    title?: string;
    emptyMessage?: string;
    showCount?: boolean;
    maxVisible?: number;
    className?: string;
}


const FollowersList: React.FC<FollowersListProps> = ({
    followers = [],
    title,
    emptyMessage,
    showCount = true,
    maxVisible,
    className = '',
}) => {
    const { t } = useTranslation();

    const displayTitle = title ?? t('social.followers');
    const displayEmptyMessage = emptyMessage ?? t('social.noFollowers');

    const displayedFollowers = maxVisible 
        ? followers.slice(0, maxVisible) 
        : followers;

    const remainingCount = maxVisible && followers.length > maxVisible 
        ? followers.length - maxVisible 
        : 0;

    return (
        <div className={className}>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0 d-flex align-items-center gap-2">
                    <FontAwesomeIcon icon={faUsers} className="text-muted" />
                    {displayTitle}
                </h5>
                {showCount && (
                    <Badge bg="secondary" pill>
                        {followers.length}
                    </Badge>
                )}
            </div>

            {followers.length === 0 ? (
                <p className="text-muted text-center py-3">{displayEmptyMessage}</p>
            ) : (
                <ListGroup variant="flush">
                    {displayedFollowers.map((follower) => (
                        <ListGroup.Item
                            key={follower.id}
                            as={Link}
                            to={RoutesPath.PROFILE.replace(':id', follower.id)}
                            action
                            className="d-flex align-items-center gap-3 py-3"
                        >
                            <Avatar
                                email={follower.email}
                                name={follower.name}
                                size={40}
                            />
                            <div className="flex-grow-1">
                                <div className="fw-semibold">{follower.name}</div>
                                <small className="text-muted">{follower.email}</small>
                            </div>
                        </ListGroup.Item>
                    ))}
                    {remainingCount > 0 && (
                        <ListGroup.Item className="text-center text-muted py-2">
                            +{remainingCount} {t('social.moreFollowers', { defaultValue: 'more' })}
                        </ListGroup.Item>
                    )}
                </ListGroup>
            )}
        </div>
    );
};

export default FollowersList;
