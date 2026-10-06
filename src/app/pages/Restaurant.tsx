import React, {ReactElement} from "react";
import {APP_NAME} from "../constants/Global";
import {withTranslation, WithTranslation} from "react-i18next";
import {Page} from "../components/Page";

class Restaurant extends React.Component<WithTranslation> {
    public componentDidMount(): void {
        const {t} = this.props;
        document.title = t("restaurant") + " - " + APP_NAME;
    }

    public render(): ReactElement | null {
        const {t} = this.props;

        return (
            <Page>
                <h2 className="mb-5">{t("restaurant_title")}</h2>
            </Page>
        );
    }
}

export default withTranslation()(Restaurant);