import React from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faUserMinus } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { useFollowMutations } from '../hooks/useFollowMutations';
import { useFollowStatus } from '../hooks/useFollowStatus';
import { useAuth } from './auth/AuthProvider';

interface FollowButtonProps {
    targetUserId: string;
    targetUserName?: string;
    variant?: 'primary' | 'outline-primary' | 'success' | 'outline-success';
    size?: 'sm' | 'lg';
    className?: string;
    onFollowChange?: (isFollowing: boolean) => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({
    targetUserId,
    targetUserName: _targetUserName,
    variant = 'primary',
    size,
    className = '',
    onFollowChange,
}) => {
    const { t } = useTranslation();
    const { userId, isAuthenticated } = useAuth();

    const { isFollowing, isLoading: isLoadingStatus } = useFollowStatus(targetUserId);

    const { follow, unfollow, isLoading: isMutating } = useFollowMutations({
        onFollowSuccess: () => {
            onFollowChange?.(true);
        },
        onUnfollowSuccess: () => {
            onFollowChange?.(false);
        },
    });

    if (!isAuthenticated || targetUserId === userId) {
        return null;
    }

    const handleClick = () => {
        if (isMutating) return;

        if (isFollowing) {
            unfollow(targetUserId);
        } else {
            follow(targetUserId);
        }
    };

    const isLoading = isLoadingStatus || isMutating;

    const buttonVariant = isFollowing 
        ? variant.includes('outline') ? 'outline-danger' : 'danger'
        : variant;

    return (
        <Button
            variant={buttonVariant}
            size={size}
            className={className}
            onClick={handleClick}
            disabled={isLoading}
            aria-label={isFollowing ? t('social.unfollow') : t('social.follow')}
        >
            {isLoading ? (
                <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                />
            ) : (
                <FontAwesomeIcon 
                    icon={isFollowing ? faUserMinus : faUserPlus} 
                    className="me-2" 
                />
            )}
            {isFollowing ? t('social.unfollow') : t('social.follow')}
        </Button>
    );
};

export default FollowButton;
