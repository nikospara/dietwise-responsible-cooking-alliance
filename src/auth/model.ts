export interface UserInfo {
	username: string;
}

export interface AuthenticationInfo {
	isAuthenticated: boolean;
	userInfo?: UserInfo;
}

export interface User {
	email: string;
}
