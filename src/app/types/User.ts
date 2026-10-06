import Follower from "./Follower";

export default interface User {
    id: string;
    name: string;
    email: string;
    rating: number;
    following: Follower[];
    followers: Follower[];
}

export interface UserLoginResponse {
    token: string;
    id: string;
}

export interface UserLogin {
    email: string;
    password: string;
}

export interface UserSignup {
    name: string;
    email: string;
    password: string;
}