import React, {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {RoutesPath} from "../../RoutesPath";
import {useAuth} from "./AuthProvider";

interface AuthRouteProps {
    children: React.ReactElement;
}

const AuthRoute: React.FC<AuthRouteProps> = ({children}) => {
    const navigate = useNavigate();
    const {isAuthenticated} = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            navigate(RoutesPath.INDEX, {replace: true});
        }
    }, [isAuthenticated, navigate]);

    if (isAuthenticated) {
        return null;
    }

    return children;
};

export default AuthRoute;
