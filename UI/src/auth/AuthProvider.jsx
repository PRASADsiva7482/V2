import { createContext, useContext, useState, useEffect } from 'react';
import keycloak from './keycloak';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Initialize Keycloak
        keycloak
            .init({
                onLoad: 'login-required', // Redirects to login if not authenticated
                checkLoginIframe: false,
                pkceMethod: 'S256'
            })
            .then((auth) => {
                setAuthenticated(auth);

                if (auth) {
                    // Load user profile
                    keycloak.loadUserProfile().then((profile) => {
                        setUser(profile);
                    });

                    // Setup token refresh
                    setInterval(() => {
                        keycloak.updateToken(70).then((refreshed) => {
                            if (refreshed) {
                                console.log('Token refreshed');
                            }
                        }).catch(() => {
                            console.error('Failed to refresh token');
                            logout();
                        });
                    }, 60000); // Check every minute
                }

                setLoading(false);
            })
            .catch((error) => {
                console.error('Keycloak init failed:', error);
                setLoading(false);
            });
    }, []);

    const login = () => {
        keycloak.login();
    };

    const logout = () => {
        keycloak.logout({
            redirectUri: window.location.origin
        });
    };

    const getToken = () => {
        return keycloak.token;
    };

    const hasRole = (role) => {
        return keycloak.hasRealmRole(role);
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '1.5rem',
                color: '#6366f1'
            }}>
                Loading...
            </div>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                user,
                login,
                logout,
                getToken,
                hasRole,
                keycloak
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
