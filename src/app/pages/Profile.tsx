import React, { ReactElement } from "react";
import { APP_NAME } from "../constants/Global";
import { useTranslation, WithTranslation } from "react-i18next";
import { Page } from "../components/Page";
import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import UserRestaurantList from "../components/UserRestaurantList";
import Restaurant from "../types/Restaurant";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import User from "../types/User";
import { ROUTES } from "../api/routes";
import { fetchData, fetchAllVisits } from "../api/queryClient";
import { RoutesPath } from "../RoutesPath";
import { Tab, Tabs, Card, Row, Col } from "react-bootstrap";
import { getRestaurantById } from "../api/restaurantService";
import ErrorPage from "./ErrorPage";
import { LoadingScreen } from "../components/LoadingScreen";
import { notificationService } from "../utils/notificationService";
import VisitModalReadOnly from "../components/VisitModalReadOnly";
import { VisitReadOnlyData } from "../types/Visit";
import { useAuth } from "../components/auth/AuthProvider";
import Avatar from "../components/Avatar";
import FollowButton from "../components/FollowButton";
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

interface ProfileProps extends WithTranslation {
    userQuery: UseQueryResult<User, AxiosError>;
    visitsQuery: UseQueryResult<Visit[], AxiosError>;
    token?: string;
    profileUserId: string;
    currentUserId?: string | null;
    navigate: NavigateFunction;
}

interface ProfileState {
    user?: User;
    visits: Visit[];
    restaurants: Restaurant[];
    loadingRestaurants: boolean;
    selectedVisit: VisitReadOnlyData | null;
    showVisitModal: boolean;
    selectedRestaurantName: string;
    activeTab: string;
}

class InnerProfile extends React.Component<ProfileProps, ProfileState> {
    constructor(props: ProfileProps) {
        super(props);
        this.state = {
            user: props.userQuery.data,
            visits: props.visitsQuery.data || [],
            restaurants: [],
            loadingRestaurants: false,
            selectedVisit: null,
            showVisitModal: false,
            selectedRestaurantName: "",
            activeTab: "followers"
        };
    }

    async componentDidMount(): Promise<void> {
        const { userQuery } = this.props;
        if (userQuery.data) {
            document.title = `${userQuery.data.name} - ${APP_NAME}`;
        }
        const initialVisits = this.props.visitsQuery.data || [];
        if (initialVisits.length > 0) {
            await this.convertVisitsToRestaurants(initialVisits);
        }
    }

    async componentDidUpdate(prevProps: Readonly<ProfileProps>): Promise<void> {
        if (prevProps.userQuery.data !== this.props.userQuery.data) {
            this.setState({ user: this.props.userQuery.data });
            if (this.props.userQuery.data) {
                document.title = `${this.props.userQuery.data.name} - ${APP_NAME}`;
            }
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
                    notificationService.logError('Profile.fetchRestaurant', error, {
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
            notificationService.logError('Profile.convertVisits', error, {
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
            notificationService.logError('Profile.showVisitModal', error, {
                restaurantId
            });
        }
    };

    private handleCloseVisitModal = () => {
        this.setState({
            showVisitModal: false,
            selectedVisit: null,
            selectedRestaurantName: ""
        });
    };

    render(): ReactElement | null {
        const { t, visitsQuery, userQuery, profileUserId, currentUserId, navigate } = this.props;
        const { user, restaurants, activeTab } = this.state;

        if (profileUserId === currentUserId) {
            navigate(RoutesPath.USER_PROFILE);
            return null;
        }

        if (userQuery.isLoading || visitsQuery.isLoading) {
            return <LoadingScreen />;
        }
        if (userQuery.isError) {
            return <ErrorPage
                error={userQuery.error}
                onRetry={() => userQuery.refetch()}
            />;
        }
        if (!user) {
            return <ErrorPage error={t("social.userNotFound")} />;
        }

        return (
            <Page>
                <div className="mt-5 pt-4">
                    <Card className="mb-4">
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col xs={12} md="auto" className="text-center text-md-start mb-3 mb-md-0">
                                    <Avatar
                                        email={user.email}
                                        name={user.name}
                                        size={100}
                                    />
                                </Col>
                                <Col xs={12} md className="text-center text-md-start">
                                    <h2 className="mb-1">{user.name}</h2>
                                    <p className="text-muted mb-2">{user.email}</p>
                                    <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-3 mb-3">
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
                                    <FollowButton
                                        targetUserId={profileUserId}
                                        targetUserName={user.name}
                                        variant="primary"
                                    />
                                </Col>
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
                        <h3 className="mb-3 text-body">{t("userProfile.recentVisits")}</h3>
                        {restaurants.length > 0 ? (
                            <UserRestaurantList
                                restaurants={restaurants}
                                onRestaurantClick={this.handleShowVisitModal}
                            />
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-muted">{t("userProfile.noVisits")}</p>
                            </div>
                        )}
                    </div>

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

const Profile: React.FC = () => {
    const { i18n, t, ready } = useTranslation();
    const { token, userId } = useAuth();
    const navigate = useNavigate();
    const params = useParams<{ id?: string }>();
    const profileUserId = params.id!;

    const userQuery = useQuery<User, AxiosError>({
        queryKey: ["users", profileUserId],
        queryFn: () => fetchData(ROUTES.USER_BY_ID, token, { id: profileUserId }),
        enabled: !!profileUserId && !!token
    });

    const visitsQuery = useQuery<Visit[], AxiosError>({
        queryKey: ["visits", profileUserId],
        queryFn: async () => await fetchAllVisits(profileUserId, token!),
        enabled: !!profileUserId && !!token,
        refetchOnWindowFocus: true,
        refetchOnMount: true
    });

    return (
        <InnerProfile
            userQuery={userQuery}
            visitsQuery={visitsQuery}
            t={t}
            i18n={i18n}
            tReady={ready}
            token={token!}
            profileUserId={profileUserId}
            currentUserId={userId}
            navigate={navigate}
        />
    );
};

export default Profile;
