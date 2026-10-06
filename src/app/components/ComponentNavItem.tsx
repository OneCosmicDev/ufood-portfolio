import React, {ReactElement} from "react";

import Nav from "react-bootstrap/Nav";
import {NavLink} from "react-router-dom";

interface ComponentNavItemProps {
    label?: string;
    icon?: ReactElement;
    link: string;
    onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent> | React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export class ComponentNavItem extends React.Component<ComponentNavItemProps, unknown> {
    public props: ComponentNavItemProps;

    constructor(props: ComponentNavItemProps) {
        super(props);
        this.props = props;
    }

    public render(): ReactElement {
        return (
            <Nav.Link as={NavLink} to={this.props.link}
                      className={this.props.icon ? "p-0 d-flex align-items-center gap-4" : ""}
                      onClick={this.props.onClick} end>
                {this.props.label}
                <span>{this.props.icon}</span>
            </Nav.Link>
        );
    }
}
