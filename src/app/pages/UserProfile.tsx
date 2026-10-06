import React, { ReactElement } from "react";
import { APP_NAME } from "../constants/Global";
import { useTranslation, WithTranslation } from "react-i18next";
import { Page } from "../components/Page";
import { Link, useParams, useNavigate } from "react-router-dom";
import UserRestaurantList from "../components/UserRestaurantList";
import Restaurant from "../types/Restaurant";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faHeart } from "@fortawesome/free-solid-svg-icons";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import User from "../types/User";
import { ROUTES } from "../api/routes";
import { fetchData, fetchAllVisits } from "../api/queryClient";
import { followUser, unfollowUser, checkFollowing } from "../api/userService";

import { RoutesPath } from "../RoutesPath";
import { Button, Card, Tab, Tabs, Row, Col } from "react-bootstrap";
import { getRestaurantById } from "../api/restaurantService";
import ErrorPage from "./ErrorPage";
import { LoadingScreen } from "../components/LoadingScreen";
import { notificationService } from "../utils/notificationService";
import VisitModalReadOnly from "../components/VisitModalReadOnly";
import { VisitReadOnlyData } from "../types/Visit";
import {useAuth} from "../components/auth/AuthProvider";
import Avatar from "../components/Avatar";
import FollowersList from "../components/FollowersList";
import FollowingList from "../components/FollowingList";
import {AxiosError} from "axios";

interface Visit {
    restaurant_id: string;
    user_id: string;
    comment: string;
    rating: number;
    date: string;
    id: string;
}

interface UserProfileProps extends WithTranslation {
    userQuery: UseQueryResult<User, AxiosError>;
    visitsQuery: UseQueryResult<Visit[], AxiosError>;
    isFollowingQuery?: UseQueryResult<boolean, AxiosError>;
    token?: string;
    currentUserId?: string | null;
}

interface UserProfileState {
    user?: User;
    visits: Visit[];
    restaurants: Restaurant[];
    loadingRestaurants: boolean;
    selectedVisit: VisitReadOnlyData | null;
    showVisitModal: boolean;
    selectedRestaurantName: string;
    isFollowing: boolean;
    loadingFollow: boolean;
    activeTab: string;
}

class InnerUserProfile extends React.Component<UserProfileProps, UserProfileState> {
    constructor(props: UserProfileProps) {
        super(props);
        this.state = {
            user: props.userQuery.data,
            visits: props.visitsQuery.data || [],
            restaurants: [],
            loadingRestaurants: false,
            selectedVisit: null,
            showVisitModal: false,
            selectedRestaurantName: "",
            isFollowing: props.isFollowingQuery?.data || false,
            loadingFollow: false,
            activeTab: "followers"
        };
    }

    async componentDidMount(): Promise<void> {
        const { t } = this.props;
        document.title = `${t("userProfile.title")} - ${APP_NAME}`;
        const initialVisits = this.props.visitsQuery.data || [];
        if (initialVisits.length > 0) {
            await this.convertVisitsToRestaurants(initialVisits);
        }
    }

    async componentDidUpdate(prevProps: Readonly<UserProfileProps>) : Promise<void> {
        if (prevProps.userQuery.data !== this.props.userQuery.data) {
            this.setState({ user: this.props.userQuery.data });
        }
        if (prevProps.isFollowingQuery?.data !== this.props.isFollowingQuery?.data) {
            this.setState({ isFollowing: this.props.isFollowingQuery?.data || false });
        }
        const prevVisits = prevProps.visitsQuery.data || [];
        const currentVisits = this.props.visitsQuery.data || [];

        const prevIds = prevVisits.map(v => v.id).sort().join(',');
        const currentIds = currentVisits.map(v => v.id).sort().join(',');

        if (prevVisits.length !== currentVisits.length || prevIds !== currentIds) {
            this.setState({ visits: currentVisits });
            if (currentVisits.length > 0) {
                await this.convertVisitsToRestaurants(currentVisits);
            } else {
                this.setState({ restaurants: [] });
            }
        }
    }

    async convertVisitsToRestaurants(visits: Visit[]): Promise<void> {
        if (visits.length === 0) {
            this.setState({ restaurants: [] });
            return;
        }

        this.setState({ loadingRestaurants: true });

        try {
            const visitsByRestaurant = visits.reduce((acc, visit) => {
                const restaurantId = visit.restaurant_id;
                if (!acc[restaurantId]) {
                    acc[restaurantId] = [];
                }
                acc[restaurantId].push(visit);
                return acc;
            }, {} as Record<string, Visit[]>);

            const restaurantIds = Object.keys(visitsByRestaurant);
            const restaurantsPromises = restaurantIds.map(async (restaurantId) => {
                const visitCount = visitsByRestaurant[restaurantId].length;
                try {
                    const restaurant = await getRestaurantById(restaurantId, this.props.token!);
                    return {
                        ...restaurant,
                        visits: visitCount
                    } as Restaurant;
                } catch (error) {
                    notificationService.logError('UserProfile.fetchRestaurant', error, {
                        restaurantId,
                        visitCount
                    });
                    return null;
                }
            });

            const restaurants = (await Promise.all(restaurantsPromises))
                .filter((r): r is Restaurant => r !== null);

            this.setState({ restaurants, loadingRestaurants: false });
        } catch (error) {
            notificationService.logError('UserProfile.convertVisits', error, {
                visitCount: visits.length
            });
            this.setState({ restaurants: [], loadingRestaurants: false });
        }
    }

    private handleShowVisitModal = async (restaurantId: string) => {
        try {
            const restaurantVisits = this.state.visits.filter(v => v.restaurant_id === restaurantId);

            if (restaurantVisits.length === 0) return;

            const sortedVisits = restaurantVisits.sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            const mostRecentVisit = sortedVisits[0];

            const restaurant = await getRestaurantById(restaurantId, this.props.token!);
            const visitReadOnlyData: VisitReadOnlyData = {
                date: mostRecentVisit.date,
                rating: mostRecentVisit.rating,
                comment: mostRecentVisit.comment,
                restaurantId: mostRecentVisit.restaurant_id
            };

            this.setState({
                selectedVisit: visitReadOnlyData,
                selectedRestaurantName: restaurant.name,
                showVisitModal: true
            });
        } catch (error) {
            notificationService.logError('UserProfile.showVisitModal', error, {
                restaurantId
            });
            const restaurantVisits = this.state.visits.filter(v => v.restaurant_id === restaurantId);
            if (restaurantVisits.length > 0) {
                const sortedVisits = restaurantVisits.sort((a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                );
                const mostRecentVisit = sortedVisits[0];

                const visitReadOnlyData: VisitReadOnlyData = {
                    date: mostRecentVisit.date,
                    rating: mostRecentVisit.rating,
                    comment: mostRecentVisit.comment,
                    restaurantId: mostRecentVisit.restaurant_id
                };

                this.setState({
                    selectedVisit: visitReadOnlyData,
                    selectedRestaurantName: "",
                    showVisitModal: true
                });
            }
        }
    };

    private handleCloseVisitModal = () => {
        this.setState({
            showVisitModal: false,
            selectedVisit: null,
            selectedRestaurantName: ""
        });
    };

    private handleFollowToggle = async () => {
        const { user, isFollowing } = this.state;
        const { token } = this.props;

        if (!user || !token) return;

        this.setState({ loadingFollow: true });

        try {
            if (isFollowing) {
                await unfollowUser(user.id, token);
                this.setState({ isFollowing: false });
            } else {
                await followUser(user.id, token);
                this.setState({ isFollowing: true });
            }
            await this.props.isFollowingQuery?.refetch();
            await this.props.userQuery.refetch();
        } catch (error) {
            notificationService.logError("UserProfile.handleFollowToggle", error);
        } finally {
            this.setState({ loadingFollow: false });
        }
    };

    render(): ReactElement | null {
        const { t, visitsQuery, userQuery } = this.props;
        const { user, restaurants, activeTab } = this.state;

        if (userQuery.isLoading || visitsQuery.isLoading) {
            return <LoadingScreen />;
        }
        if (userQuery.isError) {
            return <ErrorPage
                error={userQuery.error}
                onRetry={async() => await userQuery.refetch()}
            />;
        }
        if (visitsQuery.isError) {
            return <ErrorPage
                error={visitsQuery.error}
                onRetry={async () => await visitsQuery.refetch()}
            />;
        }
        if (!user) {
            return <ErrorPage error={t("error.no_data")} />;
        }

        const restaurantsToShow = restaurants;
        const isCurrentUser = this.props.currentUserId === user.id;

        return (
            <Page>
                <div className="mt-5 pt-4">
                    <h2 className="mb-4">{t("userProfile.title")}</h2>

                    <Card className="mb-4">
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col xs={12} md="auto" className="text-center text-md-start mb-3 mb-md-0">
                                    <Avatar 
                                        email={user.email} 
                                        name={user.name}
                                        size={80}
                                    />
                                </Col>
                                <Col xs={12} md className="text-center text-md-start">
                                    <h3 className="mb-1">{user.name}</h3>
                                    <p className="text-muted mb-2">{user.email}</p>
                                    <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-3 flex-wrap">
                                        <span className="d-flex align-items-center">
                                            <FontAwesomeIcon icon={faStar} className="text-warning me-2" />
                                            <strong>{user.rating}</strong>
                                            <span className="text-muted ms-1">{t("userProfile.score")}</span>
                                        </span>
                                        <span className="text-muted">•</span>
                                        <span>
                                            <strong>{user.followers?.length || 0}</strong>
                                            <span className="text-muted ms-1">{t("social.followers")}</span>
                                        </span>
                                        <span className="text-muted">•</span>
                                        <span>
                                            <strong>{user.following?.length || 0}</strong>
                                            <span className="text-muted ms-1">{t("social.following")}</span>
                                        </span>
                                    </div>
                                </Col>
                                {!isCurrentUser && this.props.currentUserId && (
                                    <Col xs={12} md="auto" className="text-center text-md-end mt-3 mt-md-0">
                                        <Button 
                                            variant={this.state.isFollowing ? "outline-secondary" : "primary"}
                                            onClick={this.handleFollowToggle}
                                            disabled={this.state.loadingFollow}
                                            size="lg"
                                        >
                                            {this.state.loadingFollow ? "..." : (this.state.isFollowing ? t("userProfile.unfollow") : t("userProfile.follow"))}
                                        </Button>
                                    </Col>
                                )}
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Body>
                            <Tabs
                                activeKey={activeTab}
                                onSelect={(k) => this.setState({ activeTab: k || "followers" })}
                                className="mb-3"
                            >
                                <Tab
                                    eventKey="followers"
                                    title={`${t("social.followers")} (${user.followers?.length || 0})`}
                                >
                                    <FollowersList
                                        followers={user.followers || []}
                                        showCount={false}
                                    />
                                </Tab>
                                <Tab
                                    eventKey="following"
                                    title={`${t("social.following")} (${user.following?.length || 0})`}
                                >
                                    <FollowingList
                                        following={user.following || []}
                                        showCount={false}
                                    />
                                </Tab>
                            </Tabs>
                        </Card.Body>
                    </Card>

                    <div className="mb-5">
                        <h3 className="mb-3 text-center text-body">{t("userProfile.recentVisits")}</h3>
                        {restaurantsToShow.length > 0 ? (
                            <UserRestaurantList
                                restaurants={restaurantsToShow}
                                onRestaurantClick={this.handleShowVisitModal}
                            />
                        ) : (
                            <div className="text-center">
                                <p className="lead text-body-secondary">{isCurrentUser ? t("userProfile.noVisits") : t("userProfile.noVisitsOther")}</p>
                                {isCurrentUser && <Link to="/" className="btn btn-success mt-3">{t("index")}</Link>}
                            </div>
                        )}
                    </div>

                    <hr className="my-5" />

                    {isCurrentUser && (
                        <div className="text-center py-5">
                            <h3 className="mb-3 text-body">{t("favorites.title")}</h3>
                            <p className="lead text-body-secondary">
                                {t("favorites.profileSectionDescription")}
                            </p>
                            <Link to={RoutesPath.FAVORITES}>
                                <Button variant="success" size="lg" className="mt-3">
                                    <FontAwesomeIcon icon={faHeart} className="me-2" />
                                    {t("favorites.viewMyLists")}
                                </Button>
                            </Link>
                        </div>
                    )}

                    <VisitModalReadOnly
                        show={this.state.showVisitModal}
                        onHide={this.handleCloseVisitModal}
                        visitData={this.state.selectedVisit}
                        restaurantName={this.state.selectedRestaurantName}
                    />
                </div>
            </Page>
        );
    }
}

const UserProfile: React.FC = () => {
    const { i18n, t, ready } = useTranslation();
    const { token, userId: authUserId } = useAuth();
    const { id: paramId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    React.useEffect(() => {
        if (!paramId && authUserId) {
            navigate(RoutesPath.USER_PROFILE.replace(':id', authUserId), { replace: true });
        }
    }, [paramId, authUserId, navigate]);
    
    const targetUserId = paramId || authUserId;

    const userQuery = useQuery<User, AxiosError>({
        queryKey: ["users", targetUserId], 
        queryFn: () => fetchData(ROUTES.USER_BY_ID, token || null, { id: targetUserId! }),
        enabled: !!targetUserId && !!token
    });
    
    const visitsQuery = useQuery<Visit[], AxiosError>({
        queryKey: ["visits", targetUserId],
        queryFn: async () => await fetchAllVisits(targetUserId!, token || ''),
        enabled: !!targetUserId && !!token,
        refetchOnWindowFocus: true,
        refetchOnMount: true
    });

    const isFollowingQuery = useQuery<boolean, AxiosError>({
        queryKey: ["isFollowing", targetUserId],
        queryFn: async () => {
            if (authUserId) {
                try {
                    const currentUser = await fetchData<User>(ROUTES.USER_BY_ID, token || null, { id: authUserId });
                    const isInList = currentUser.following?.some((f: any) => {
                        const followingId = typeof f === 'string' ? f : f.id;
                        return followingId === targetUserId;
                    });
                    if (isInList) return true;
                } catch (e) {
                    notificationService.logError('UserProfile.isFollowing', e);
                }
            }
            
            return checkFollowing(targetUserId!, token || '');
        },
        enabled: !!targetUserId && !!token && !!authUserId && targetUserId !== authUserId
    });

    return <InnerUserProfile 
        userQuery={userQuery} 
        visitsQuery={visitsQuery} 
        isFollowingQuery={isFollowingQuery}
        t={t} 
        i18n={i18n} 
        tReady={ready} 
        token={token || undefined} 
        currentUserId={authUserId}
    />;
}

export default UserProfile;
