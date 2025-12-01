import api from "./api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post("/auth/login", credentials);
    const { access_token, user } = response.data;

    localStorage.setItem("token", access_token);
    localStorage.setItem("user", JSON.stringify(user));

    return { token: access_token, user };
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  },
};
