import React, {useState} from "react";
import {Alert, Button, Form} from "react-bootstrap";
import {useMutation} from "@tanstack/react-query";
import {Link} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {LoadingScreen} from "../components/LoadingScreen";
import {ROUTES} from "../api/routes";
import {UserLogin, UserLoginResponse} from "../types/User";
import {postData} from "../api/queryClient";
import {Page} from "../components/Page";
import {RoutesPath} from "../RoutesPath";
import {useAuth} from "../components/auth/AuthProvider";

const Login: React.FC = (): React.ReactElement => {
    const {t} = useTranslation();
    const [formData, setFormData] = useState<UserLogin>({
        email: "",
        password: ""
    });
    const [submitted, setSubmitted] = useState(false);
    const {storeToken, storeUserId} = useAuth();

    const loginMutation = useMutation<UserLoginResponse | null>({
        mutationFn: () => postData<UserLoginResponse>(ROUTES.LOGIN, {...formData}),
        onSuccess: (data) => {
            if (data) {
                storeToken(data.token);
                storeUserId(data.id);
            }
        },
        retry: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSubmitted(true);

        if (formData.email.trim().length < 1 || formData.password.trim().length < 1) {
            return;
        }

        loginMutation.mutate();
    };

    const handleInputChange = (field: keyof UserLogin, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (loginMutation.isPending) {
        return <LoadingScreen/>;
    }

    return (
        <Page>
            <div className="d-flex flex-column align-items-center">
                <h2>{t("connection")}</h2>

                {loginMutation.isError && (
                    <Alert variant="danger" className="mt-3" role="alert">
                        {t("login.error.generic")}
                    </Alert>
                )}

                <Form className="w-xl-30" onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label name="email">{t("email")}</Form.Label>
                        <Form.Control
                            value={formData.email}
                            isInvalid={submitted && formData.email.trim().length < 1}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                        />
                        <Form.Control.Feedback type="invalid">{t("login.error.invalidEmail")}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="password">
                        <Form.Label name="password">{t("password")}</Form.Label>
                        <Form.Control
                            type="password"
                            value={formData.password}
                            isInvalid={submitted && formData.password.trim().length < 1}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                        />
                        <Form.Control.Feedback type="invalid">{t("login.error.invalidPassword")}</Form.Control.Feedback>
                    </Form.Group>
                    <div className="mt-4">
                        {t("login.noAccount")} <Link to={RoutesPath.REGISTER}>{t("login.createAccount")}</Link>
                    </div>
                    <div className="d-flex justify-content-center mt-4">
                        <Button type="submit">
                            {t("connection")}
                        </Button>
                    </div>
                </Form>

            </div>
        </Page>
    );
}

export default React.memo(Login);