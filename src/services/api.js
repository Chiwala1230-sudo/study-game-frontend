import axios from 'axios';

const API_BASE_URL = 'https://study-game-backend-1-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;