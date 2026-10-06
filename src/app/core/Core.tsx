import {Component, ReactElement, Suspense} from "react";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {ReactNotifications} from "react-notifications-component";
import {BASE_URL} from "../constants/Global";
import "../deps/css/bootstrap.min.css";
import "../deps/css/animations.css";
import "../deps/css/app.css";
import "../deps/css/mediaqueries.css";
import "react-notifications-component/dist/theme.css";
import "animate.css";

import NavigationBar from "../components/NavigationBar";
import About from "../pages/About";
import UserProfile from "../pages/UserProfile";
import FollowingPage from "../pages/FollowingPage";
import FollowersPage from "../pages/FollowersPage";
import FavoritesPage from "../pages/FavoritesPage";
import Footer from "../components/Footer";
import RouteNotFound from "../pages/RouteNotFound";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import {RoutesPath} from "../RoutesPath";
import {LoadingScreen} from "../components/LoadingScreen";
import {AnimatePresence} from "framer-motion";
import Visit from "../types/Visit";
import RestaurantDetailPage from "../pages/RestaurantDetailPage";
import Index from "../pages/Index";
import {QueryClientProvider} from "@tanstack/react-query";
import {queryClient} from "../api/queryClient";
import AuthProvider from "../components/auth/AuthProvider";
import Register from "../pages/Register";
import Login from "../pages/Login";
import AuthRoute from "../components/auth/AuthRoute";

interface CoreState {
    isDarkMode: boolean;
    userVisits: Visit[];
    searchPlaceholder: string;
}

export class Core extends Component<unknown, CoreState> {
    state: CoreState = {
        isDarkMode: false,
        userVisits: [],
        searchPlaceholder: ""
    };

    toggleDarkMode = (value: boolean): void => {
        this.setState({isDarkMode: value});
    };

    addRestaurantVisit = (restaurantName: string): void => {
        this.setState(prevState => {
            const existingVisit = prevState.userVisits.find(v => v.restaurant === restaurantName);

            if (existingVisit) {
                return {
                    userVisits: prevState.userVisits.map(v =>
                        v.restaurant === restaurantName
                            ? {...v, count: v.count + 1}
                            : v
                    )
                };
            } else {
                return {
                    userVisits: [
                        ...prevState.userVisits,
                        {
                            restaurant: restaurantName,
                            count: 1,
                            image: `https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=${encodeURIComponent(
                                restaurantName
                            )}`,
                            cuisine: ["Restaurant"],
                            priceRange: "$$",
                            restaurantId: Math.floor(Math.random() * 1000)
                        }
                    ]
                };
            }
        });
    };

    render(): ReactElement | null {
        return (
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <Suspense fallback={<LoadingScreen/>}>
                        <Router basename={BASE_URL} future={{v7_relativeSplatPath: true, v7_startTransition: true}}>
                            <NavigationBar
                                toggleDarkMode={this.toggleDarkMode}
                            />
                            <ReactNotifications/>
                            <AnimatePresence mode="wait">
                                <Routes>
                                    <Route index element={
                                        <ProtectedRoute>
                                            <Index onRestaurantClick={this.addRestaurantVisit}/>
                                        </ProtectedRoute>
                                    }
                                    />

                                    <Route path={RoutesPath.USER_PROFILE} element={
                                        <ProtectedRoute>
                                            <UserProfile/>
                                        </ProtectedRoute>
                                    }
                                    />
                                    
                                    <Route path={RoutesPath.USER_FOLLOWING} element={
                                        <ProtectedRoute>
                                            <FollowingPage/>
                                        </ProtectedRoute>
                                    }
                                    />

                                    <Route path={RoutesPath.USER_FOLLOWERS} element={
                                        <ProtectedRoute>
                                            <FollowersPage/>
                                        </ProtectedRoute>
                                    }
                                    />

                                    <Route path={RoutesPath.FAVORITES} element={
                                        <ProtectedRoute>
                                            <FavoritesPage/>
                                        </ProtectedRoute>
                                    }
                                    />
                                    <Route path={RoutesPath.ABOUT} element={<About/>}/>
                                    <Route path={RoutesPath.RESTAURANT} element={
                                        <ProtectedRoute>
                                            <RestaurantDetailPage/>
                                        </ProtectedRoute>
                                    }
                                    />
                                    {<Route path={RoutesPath.LOGIN} element={
                                        <AuthRoute>
                                            <Login/>
                                        </AuthRoute>
                                    }
                                    />}
                                    <Route path={RoutesPath.REGISTER} element={
                                        <AuthRoute>
                                            <Register/>
                                        </AuthRoute>
                                    }
                                    />
                                    <Route path={RoutesPath.PROFILE} element={
                                        <ProtectedRoute>
                                            <UserProfile/>
                                        </ProtectedRoute>
                                    }
                                    />
                                    <Route path={RoutesPath.USER_PROFILE} element={
                                        <ProtectedRoute>
                                            <UserProfile/>
                                        </ProtectedRoute>
                                    }
                                    />
                                    <Route path="*" element={<RouteNotFound/>}/>
                                </Routes>
                            </AnimatePresence>
                            <Footer/>
                        </Router>
                    </Suspense>
                </AuthProvider>
            </QueryClientProvider>
        );
    }
}
