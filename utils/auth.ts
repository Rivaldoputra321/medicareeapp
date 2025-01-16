import {jwtDecode} from 'jwt-decode';
import Cookies from 'js-cookie';
export interface TokenPayload {
  sub: string;
  email: string;
  roleId: string;
  name: string;
  iat: number;
  exp: number;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface User {
  id: string;
  photo_profile: string;
  name: string;
  email: string;
  roleId: string;
  user_type?: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export const roleMap: Record<string, string> = {
  '77bf765d-4a63-4b15-b415-ebc32fd673d3': 'patient',
  '776ad594-ee63-4172-bd86-46372e9cabbd': 'doctor',
  '54a03d4d-719c-4ea8-8235-a2ff1aeedae0': 'admin',
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  const data: AuthResponse = await response.json();
  const decoded: TokenPayload = jwtDecode(data.access_token);

  const user: User = {
    id: decoded.sub,
    email: decoded.email,
    name: decoded.name,
    roleId: decoded.roleId,
    photo_profile: '', // Fallback jika photo_profile tidak tersedia
    user_type: roleMap[decoded.roleId] || 'unknown',
  };

  if (user.user_type === 'unknown') {
    throw new Error('Invalid role');
  }

  const loginResponse: LoginResponse = {
    user,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  };

  saveAuthTokens(loginResponse);
  setAuthCookies(loginResponse);

  return loginResponse;
}


// Only save tokens, not user data
function saveAuthTokens(response: AuthResponse | LoginResponse): void {
  localStorage.setItem('access_token', response.access_token);
  localStorage.setItem('refresh_token', response.refresh_token);
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded: TokenPayload = jwtDecode(token);
    return decoded.exp * 1000 < Date.now(); // Convert exp to milliseconds
  } catch {
    return true;
  }
}
// Get fresh user data from token whenever needed
export function getCurrentUser(): User | null {
  const token = localStorage.getItem('access_token');
  if (!token || isTokenExpired(token)) {
    logout();
    return null;
  }

  try {
    const decoded: TokenPayload = jwtDecode(token);
    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      roleId: decoded.roleId,
      photo_profile: '',
      user_type: roleMap[decoded.roleId] || 'unknown',
    };
  } catch (error) {
    console.error('Invalid token', error);
    return null;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return null;

  const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (response.ok) {
    const data: AuthResponse = await response.json();
    saveAuthTokens(data);
    return data.access_token;
  }
  return null;
}

export async function logout(): Promise<boolean> {
  try {
    // Get access token
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) return true;

    // Call backend logout endpoint
    const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    // Clear frontend storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');

    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}





function setAuthCookies(loginResponse: LoginResponse): void {
  Cookies.set('access_token', loginResponse.access_token, { secure: true, sameSite: 'Strict' });
  Cookies.set('refresh_token', loginResponse.refresh_token, { secure: true, sameSite: 'Strict' });
}
