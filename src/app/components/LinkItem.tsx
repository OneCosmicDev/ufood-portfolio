import React, {MouseEventHandler, ReactElement} from "react";

import {Button} from "react-bootstrap";
import {useNavigate} from "react-router-dom";

interface LinkItemProps {
    label: string;
    link: string;
    variant?: "secondary" | "success" | "danger" | "primary" | "warning" | "info" | "light" | "dark" | "link";
    onClick?: MouseEventHandler<HTMLButtonElement>;
}

const LinkItemComponent: React.FC<LinkItemProps> = (props): ReactElement => {
    const {label, link, onClick} = props;
    const navigate = useNavigate();

    const onClickHandler: MouseEventHandler<HTMLButtonElement> = (event) => {
        if (onClick) {
            onClick(event);
        }
        navigate(link);
    }

    return (
        <Button variant={props.variant} onClick={onClickHandler} className="btn-nowrap">
            <span>{label}</span>
        </Button>

    );
};

export const LinkItem = React.memo(LinkItemComponent) as React.FC<LinkItemProps>;
