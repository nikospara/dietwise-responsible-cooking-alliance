import { createContext } from 'react';
import type { AuthenticationInfo } from './model';

export const AuthContext = createContext<AuthenticationInfo>({
	isAuthenticated: false,
});
