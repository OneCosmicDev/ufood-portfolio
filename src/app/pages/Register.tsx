import React, {useState} from "react";
import {Alert, Button, Form} from "react-bootstrap";
import {useMutation} from "@tanstack/react-query";
import {Link, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {LoadingScreen} from "../components/LoadingScreen";
import {ROUTES} from "../api/routes";
import {UserSignup} from "../types/User";
import {postData} from "../api/queryClient";
import {Page} from "../components/Page";
import {RoutesPath} from "../RoutesPath";
import {EMAIL_REGEX} from "../constants/Global";
import {notificationService} from "../utils/notificationService";

const Register: React.FC = (): React.ReactElement => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<UserSignup>({
        name: "",
        email: "",
        password: ""
    });
    const [submitted, setSubmitted] = useState(false);

    const registerMutation = useMutation<UserSignup | null>({
        mutationFn: () => postData<UserSignup>(ROUTES.SIGNUP, {...formData}).then((res) => res),
        onSuccess: () => {
            navigate(RoutesPath.LOGIN);
        },
        retry: 0,
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        e.stopPropagation();

        setSubmitted(true);

        const nameValid = formData.name.trim().length >= 3;
        const emailValid = EMAIL_REGEX.test(formData.email);
        const passwordValid = formData.password.trim().length >= 5;

        if (nameValid && emailValid && passwordValid) {
            registerMutation.mutate();
            notificationService.success(t("signup.success"));
        } else {
            return;
        }
    };

    const handleInputChange = (field: keyof UserSignup, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (registerMutation.isPending) {
        return <LoadingScreen/>;
    }

    return (
        <Page>
            <div className="d-flex flex-column align-items-center">
                <h2>{t("signup.title")}</h2>

                {registerMutation.isError && (
                    <Alert variant="danger" className="mt-3" role="alert">
                        {t("signup.error.generic")}
                    </Alert>
                )}

                <Form className="w-xl-30" onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label name="name">{t("name")}</Form.Label>
                        <Form.Control
                            value={formData.name}
                            isInvalid={submitted && formData.name.trim().length < 3}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                        />
                        <Form.Control.Feedback type="invalid">{t("signup.error.invalidName")}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label name="email">{t("email")}</Form.Label>
                        <Form.Control
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            isInvalid={submitted && !EMAIL_REGEX.test(formData.email)}/>
                        <Form.Control.Feedback type="invalid">{t("signup.error.invalidEmail")}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="password">
                        <Form.Label name="password">{t("password")}</Form.Label>
                        <Form.Control
                            type="password"
                            value={formData.password}
                            isValid={submitted && formData.password.trim().length >= 5}
                            onChange={(e) => handleInputChange("password", e.target.value)}/>
                        <Form.Control.Feedback
                            type="invalid">{t("signup.error.invalidPassword")}</Form.Control.Feedback>
                    </Form.Group>
                    <div className="mt-4">
                        {t("signup.haveAccount")} <Link to={RoutesPath.LOGIN}>{t("signup.loginHere")}</Link>
                    </div>
                    <div className="d-flex justify-content-center mt-4">
                        <Button type="submit">
                            {t("register")}
                        </Button>
                    </div>
                </Form>
            </div>
        </Page>
    );
}

export default React.memo(Register);