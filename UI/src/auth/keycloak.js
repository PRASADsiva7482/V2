import Keycloak from 'keycloak-js';

// Initialize Keycloak instance using config from window.config
const keycloak = new Keycloak({
    url: window.config?.keycloak?.url || 'http://localhost:8080',
    realm: window.config?.keycloak?.realm || 'your-realm',
    clientId: window.config?.keycloak?.clientId || 'your-client-id'
});

export default keycloak;
