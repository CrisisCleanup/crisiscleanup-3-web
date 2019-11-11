import axios from "axios";

const AuthService = {
    getUser() {
        return JSON.parse(localStorage.getItem('user'))
    },
    getToken() {
        let user = localStorage.getItem('user');
        if (user) {
            return JSON.parse(user).access_token;
        }
        return null;
    },
    saveUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
        axios.defaults.headers.common["Authorization"] = `Bearer ${user.access_token}`;
    },
    removeUser() {
        localStorage.removeItem('user')
        axios.defaults.headers.common["Authorization"] = null
    }
};

export { AuthService }