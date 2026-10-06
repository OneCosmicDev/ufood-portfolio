import React, {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {RoutesPath} from "../../RoutesPath";
import {useAuth} from "./AuthProvider";

interface ProtectedRouteProps {
    children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({children}) => {
    const navigate = useNavigate();
    const {isAuthenticated} = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate(RoutesPath.LOGIN, {replace: true});
        }
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated) {
        return null;
    }

    return children;
};

export default ProtectedRoute;
