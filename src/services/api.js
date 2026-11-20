import Constants from 'expo-constants';

const PORT = 3333;
const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const expoHostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost || '';
const expoHost = expoHostUri ? expoHostUri.split(':')[0] : '';

// Em desenvolvimento, reutiliza o IP do servidor Expo para alcançar a API
// executada no mesmo computador. EXPO_PUBLIC_API_URL permite sobrescrever isso.
export const API_BASE_URL = configuredUrl || (expoHost
  ? `http://${expoHost}:${PORT}/api`
  : `http://127.0.0.1:${PORT}/api`);

async function request(path, { method = 'GET', body, token } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error(`Não foi possível conectar à API do CodeQuest (${API_BASE_URL}). Confirme se o servidor está ligado e se o celular e o computador estão na mesma rede Wi-Fi.`);
  }

  let data = {};
  try { data = await response.json(); } catch { /* A resposta pode não conter JSON. */ }
  if (!response.ok) {
    const error = new Error(data.error || `Falha na comunicação com o servidor (${response.status}).`);
    error.status = response.status;
    error.code = data.code;
    throw error;
  }
  return data;
}

export const authApi = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: (token) => request('/auth/me', { token }),
  logout: (token) => request('/auth/logout', { method: 'POST', token }),
  updateProfile: (token, profile) => request('/profile', { method: 'PUT', token, body: profile }),
  health: () => request('/health'),
};
