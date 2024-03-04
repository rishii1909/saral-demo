import { Route, Redirect } from 'react-router-dom';
import { useAuth } from './authContext';

const AuthenticatedRoute = ({ component: Component, ...rest }) => {
    const { isAuthenticated } = useAuth();

    return (
        <Route
            {...rest}
            render={(props) =>
                isAuthenticated() ? <Component {...props} /> : <Redirect to="/login" />
            }
        />
    );
};

export default AuthenticatedRoute;
