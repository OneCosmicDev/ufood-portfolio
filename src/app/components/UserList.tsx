import React from "react";
import { Row, Col } from "react-bootstrap";
import User from "../types/User";
import { motion } from "framer-motion";
import UserCard from "./UserCard";
import { WithTranslation, withTranslation } from "react-i18next";

interface UserListProps extends WithTranslation {
    users: User[];
    onUserClick: (userId: string) => void;
    emptyMessage: string;
}

class UserList extends React.Component<UserListProps> {
    handleUserClick = (userId: string) => {
        this.props.onUserClick(userId);
    }

    render() {
        const { users, emptyMessage } = this.props;

        if (users.length === 0) {
            return (
                <Row>
                    <Col className="text-center pt-3">
                        <p className="text-body-secondary">{emptyMessage}</p>
                    </Col>
                </Row>
            );
        }

        return (
            <motion.div
                className="row gy-4"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
            >
                {users.map((user) => (
                    <motion.div
                        key={user.id}
                        variants={{
                            hidden: { opacity: 0, y: 20, scale: 0.9 },
                            visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
                        }}
                        className="col-12 col-sm-6 col-md-4 col-lg-3"
                    >
                        <UserCard
                            user={user}
                            onClick={this.handleUserClick}
                        />
                    </motion.div>
                ))}
            </motion.div>
        );
    }
}

export default withTranslation()(UserList);
