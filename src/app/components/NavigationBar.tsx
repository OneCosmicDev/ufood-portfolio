import React, {ChangeEvent, FormEvent, ReactElement} from "react";
import {Button, Container, Dropdown, Form, InputGroup, ListGroup, Offcanvas, Spinner} from "react-bootstrap";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import {LinkContainer} from "react-router-bootstrap";
import Logo from "../deps/images/logo.png";
import LogoDark from "../deps/images/logoDark.png";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMoon, faSearch, faSun, faTimes, faUsers, faUtensils} from "@fortawesome/free-solid-svg-icons";
import {RoutesPath} from "../RoutesPath";
import {ComponentNavItem as NavItem} from "./ComponentNavItem";
import {Application} from "../core/Application";
import {useTranslation, WithTranslation} from "react-i18next";
import {useAuth} from "./auth/AuthProvider";
import {useNavigate} from "react-router-dom";
import {UseMutationResult, useQuery} from "@tanstack/react-query";
import Avatar from "./Avatar";
import {useUser} from "../api/useUser";
import {LinkItem} from "./LinkItem";
import {searchUsers} from "../api/userService";
import User from "../types/User";

type SearchMode = "restaurants" | "users";

interface Props extends WithTranslation {
    toggleDarkMode: (value: boolean) => void;
    navigate: (path: string) => void;
    isAuthenticated: boolean;
    username: string;
    userEmail?: string;
    token?: string | null;
    logout: UseMutationResult<void, Error, void, unknown>;
    userSearchResults?: User[];
    isSearchingUsers?: boolean;
    onUserSearchChange?: (query: string) => void;
}

interface State {
    isDarkMode: boolean;
    language: "fr" | "en";
    showModal: boolean;
    searchValue: string;
    searchMode: SearchMode;
    showUserDropdown: boolean;
}

class NavigationBarInner extends React.Component<Props, State> {

    public constructor(props: Props) {
        super(props);
        this.state = {
            isDarkMode: false,
            language: "fr",
            showModal: false,
            searchValue: "",
            searchMode: "restaurants",
            showUserDropdown: false
        };
    }

    public componentDidMount(): void {
        const userTheme: string | null = localStorage.getItem("theme");
        let isDarkMode: boolean = false;

        if (userTheme) {
            isDarkMode = userTheme === "dark";
        } else {
            const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
            if (darkModeQuery) {
                isDarkMode = darkModeQuery.matches;
            }

        }
        this.changeTheme(isDarkMode);


        const currentLanguage = this.props.i18n.language as "fr" | "en";
        this.setState({language: currentLanguage});
    }

    public render(): ReactElement | null {
        return (
            <Navbar expand="xxl" fixed="top">
                <Container fluid className="d-flex align-items-center justify-content-between gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <LinkContainer to="/">
                            <Navbar.Brand>
                                <img
                                    src={Application.isDarkMode() ? LogoDark : Logo}
                                    alt="Logo"
                                    width={100}
                                    height={80}
                                />
                            </Navbar.Brand>
                        </LinkContainer>

                        {this.renderDesktopLinks()}
                    </div>

                    <div>
                        <Button
                            className="me-3 d-xxl-none"
                            onClick={(): void =>
                                this.changeLanguage(this.state.language === "fr" ? "en" : "fr")
                            }
                        >
                            {this.state.language === "fr" ? "EN" : "FR"}
                        </Button>
                        <Button
                            className="me-3 d-xxl-none"
                            onClick={(): void => this.changeTheme(!this.state.isDarkMode)}
                        >
                            <FontAwesomeIcon icon={this.state.isDarkMode ? faSun : faMoon}/>
                        </Button>
                        <Navbar.Toggle aria-controls="offcanvasNavbar"
                                       onClick={() => this.handleVisibilityOffCanvas(true)}/>
                    </div>

                    {this.renderOffcanvas()}
                </Container>
            </Navbar>
        );
    }

    private renderDesktopLinks(): ReactElement {
        return (
            <div className="d-none d-xxl-flex">
                {this.generalLinks()}
            </div>
        );
    }

    private renderMobileOffcanvas(): ReactElement {
        return (
            <div className="d-xxl-none d-flex flex-column align-items-center w-100 gap-4">
                {this.generalLinks()}
            </div>
        );
    }

    private renderUserControls(): ReactElement {
        const {t, isAuthenticated, userSearchResults, isSearchingUsers} = this.props;
        const {searchMode, searchValue, showUserDropdown} = this.state;

        return (
            <div
                className="ms-xxl-auto flex-xxl-row d-flex gap-3 gap-xxl-2 justify-content-center align-items-center flex-column mt-xxl-0 mt-4 flex-xxl-shrink-1">
                <Form onSubmit={this.handleSubmit} className="position-relative"
                      style={{maxWidth: '400px', width: '100%'}}>
                    <InputGroup>
                        {isAuthenticated && (
                            <Dropdown onSelect={this.handleSearchModeChange}>
                                <Dropdown.Toggle
                                    variant="outline-secondary"
                                    id="search-mode-dropdown"
                                    size="sm"
                                    className="border-end-0"
                                    title={searchMode === "restaurants" ? t("social.searchRestaurants") : t("social.searchUsers")}
                                >
                                    <FontAwesomeIcon
                                        icon={searchMode === "restaurants" ? faUtensils : faUsers}
                                    />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item eventKey="restaurants" active={searchMode === "restaurants"}>
                                        <FontAwesomeIcon icon={faUtensils} className="me-2"/>
                                        {t("social.searchRestaurants")}
                                    </Dropdown.Item>
                                    <Dropdown.Item eventKey="users" active={searchMode === "users"}>
                                        <FontAwesomeIcon icon={faUsers} className="me-2"/>
                                        {t("social.searchUsers")}
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        )}

                        <Form.Control
                            placeholder={searchMode === "users" && isAuthenticated
                                ? t("social.searchUsers")
                                : t("search_placeholder")}
                            value={searchValue}
                            onChange={this.handleSearchChange}
                            onFocus={() => searchMode === "users" && this.setState({showUserDropdown: true})}
                            onBlur={() => setTimeout(() => this.setState({showUserDropdown: false}), 200)}
                        />

                        {searchValue && (
                            <Button
                                variant="link"
                                className="text-muted position-absolute end-0 me-5 z-5"
                                onClick={() => this.setState({searchValue: "", showUserDropdown: false})}
                            >
                                <FontAwesomeIcon icon={faTimes}/>
                            </Button>
                        )}

                        <Button type="submit">
                            <FontAwesomeIcon icon={faSearch}/>
                        </Button>
                    </InputGroup>

                    {isAuthenticated && searchMode === "users" && showUserDropdown && searchValue.trim() && (
                        <div
                            className="position-absolute top-100 start-0 end-0 bg-body border rounded shadow-sm mt-1 z-3"
                            style={{maxHeight: '300px', overflowY: 'auto'}}
                        >
                            {isSearchingUsers ? (
                                <div className="text-center py-3">
                                    <Spinner animation="border" size="sm"/>
                                </div>
                            ) : userSearchResults && userSearchResults.length > 0 ? (
                                <ListGroup variant="flush">
                                    {userSearchResults.slice(0, 5).map((user) => (
                                        <ListGroup.Item
                                            key={user.id}
                                            action
                                            onClick={() => this.handleUserSelect(user)}
                                            className="d-flex align-items-center gap-2 py-2"
                                        >
                                            <Avatar email={user.email} name={user.name} size={32}/>
                                            <div className="flex-grow-1">
                                                <div className="fw-semibold small">{user.name}</div>
                                                <small className="text-muted">{user.email}</small>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <div className="text-center py-3 text-muted small">
                                    {t("social.noUsersFound", {defaultValue: "No users found"})}
                                </div>
                            )}
                        </div>
                    )}
                </Form>
                {this.props.isAuthenticated ? (
                    <>
                        <LinkContainer to={RoutesPath.FAVORITES} onClick={() => this.handleVisibilityOffCanvas(false)}>
                            <Button variant="outline-primary">
                                {t("favorites.navTitle")}
                            </Button>
                        </LinkContainer>
                        <LinkContainer to={RoutesPath.PROFILE} onClick={() => this.handleVisibilityOffCanvas(false)}>
                            <Button variant="outline-primary" className="d-flex align-items-center gap-2 py-1 px-2"
                                    size="sm">
                                <Avatar
                                    email={this.props.userEmail || "user@equipe2.com"}
                                    name={this.props.username}
                                    size={26}
                                />
                                <span className="fs-6">{this.props.username}</span>
                            </Button>
                        </LinkContainer>
                        <Button onClick={this.handleLogout}>
                            {t("disconnection")}
                        </Button>
                    </>
                ) : (
                    <>
                        <LinkItem link={RoutesPath.LOGIN} label={t("connection")}
                                  onClick={() => this.handleVisibilityOffCanvas(false)}/>
                        <LinkItem link={RoutesPath.REGISTER} label={t("register")}
                                  onClick={() => this.handleVisibilityOffCanvas(false)}/>
                    </>
                )}


                <div className="d-xxl-flex d-none">
                    <Button
                        className="me-3"
                        onClick={(): void =>
                            this.changeLanguage(this.state.language === "fr" ? "en" : "fr")
                        }
                    >
                        {this.state.language === "fr" ? "EN" : "FR"}
                    </Button>
                    <Button
                        className="me-3"
                        onClick={(): void => this.changeTheme(!this.state.isDarkMode)}
                    >
                        <FontAwesomeIcon icon={this.state.isDarkMode ? faSun : faMoon}/>
                    </Button>
                </div>
            </div>
        );
    }

    private renderOffcanvas(): ReactElement {
        return (
            <Navbar.Offcanvas
                show={this.state.showModal}
                onHide={() => this.handleVisibilityOffCanvas(false)}
                id="offcanvasNavbar"
                aria-labelledby="offcanvasNavbarLabel"
                placement="end"
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title id="offcanvasNavbarLabel">
                        <LinkContainer to="/" onClick={() => this.handleVisibilityOffCanvas(false)}>
                            <img
                                className="me-3"
                                src={Application.isDarkMode() ? Logo : LogoDark}
                                alt="Logo"
                                width={80}
                                height={60}
                            />
                        </LinkContainer>
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    {this.renderMobileOffcanvas()}
                    {this.renderUserControls()}
                </Offcanvas.Body>
            </Navbar.Offcanvas>
        );
    }

    private changeLanguage = (language: "fr" | "en"): void => {
        this.setState({language}, async () => {
            await this.props.i18n.changeLanguage(language);
        });
    };

    private changeTheme = (currentMode: boolean): void => {
        this.setState({isDarkMode: currentMode}, () => {
            document.documentElement.setAttribute("data-bs-theme", this.state.isDarkMode ? "dark" : "light");
            localStorage.setItem("theme", this.state.isDarkMode ? "dark" : "light");
            this.props.toggleDarkMode(this.state.isDarkMode);
        });
    };

    private handleLogout = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> => {
        event.preventDefault();
        this.handleVisibilityOffCanvas(false);
        await this.props.logout.mutateAsync();
    }

    private generalLinks(): ReactElement {
        const {t} = this.props;
        return (
            <Nav className="w-100" variant="underline">
                <NavItem link={RoutesPath.INDEX} label={t("index")}
                         onClick={() => this.handleVisibilityOffCanvas(false)}/>
                <NavItem link={RoutesPath.ABOUT} label={t("about")}
                         onClick={() => this.handleVisibilityOffCanvas(false)}/>
            </Nav>
        );
    }

    private handleVisibilityOffCanvas = (visible: boolean): void => {
        this.setState({showModal: visible});
    };

    private handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        const searchValue = this.state.searchValue.trim();
        if (!searchValue) return;

        const {searchMode} = this.state;

        if (searchMode === "users" && this.props.isAuthenticated) {
            this.setState({showUserDropdown: true});
        } else {
            const encoded = encodeURIComponent(searchValue);
            this.props.navigate(`${RoutesPath.INDEX}?search=${encoded}`);
            this.handleVisibilityOffCanvas(false);
        }
    };

    private handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const searchValue = event.target.value;
        this.setState({searchValue});

        if (this.state.searchMode === "users" && this.props.onUserSearchChange) {
            this.props.onUserSearchChange(searchValue);
        }
    };

    private handleSearchModeChange = (eventKey: string | null): void => {
        if (eventKey === "restaurants" || eventKey === "users") {
            this.setState({
                searchMode: eventKey as SearchMode,
                searchValue: "",
                showUserDropdown: false
            });
        }
    };

    private handleUserSelect = (user: User): void => {
        this.setState({
            searchValue: "",
            showUserDropdown: false
        });
        this.handleVisibilityOffCanvas(false);
        this.props.navigate(RoutesPath.USER_PROFILE.replace(':id', user.id));
    };
}

const NavigationBar: React.FC<{
    toggleDarkMode: (value: boolean) => void,
    onConnectionChange?: (connected: boolean) => void
}> = (props) => {
    const {i18n, t, ready} = useTranslation();
    const navigate = useNavigate();
    const {isAuthenticated, userId, token, logout} = useAuth();
    const {data: user} = useUser(userId!);

    const [userSearchQuery, setUserSearchQuery] = React.useState("");
    const [debouncedQuery, setDebouncedQuery] = React.useState("");

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(userSearchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [userSearchQuery]);

    const userSearchQueryResult = useQuery<User[], Error>({
        queryKey: ['users', 'search', debouncedQuery],
        queryFn: async () => {
            if (!token || !debouncedQuery.trim()) return [];
            return searchUsers(debouncedQuery, token);
        },
        enabled: isAuthenticated && !!token && debouncedQuery.trim().length >= 1,
        staleTime: 1000 * 30,
    });

    return (
        <NavigationBarInner
            toggleDarkMode={props.toggleDarkMode}
            i18n={i18n}
            t={t}
            tReady={ready}
            navigate={navigate}
            isAuthenticated={isAuthenticated}
            username={user?.name ?? t("userProfile.default_username")}
            userEmail={user?.email}
            token={token}
            logout={logout}
            userSearchResults={userSearchQueryResult.data}
            isSearchingUsers={userSearchQueryResult.isLoading}
            onUserSearchChange={setUserSearchQuery}
        />
    );
}

export default NavigationBar;
