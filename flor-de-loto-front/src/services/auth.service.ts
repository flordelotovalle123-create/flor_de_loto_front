import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

export interface LoginResponse {
  token: string
  usuario: {
    id: string
    nombre: string
    email: string
    rol: string
  }
}

export const loginRequest = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    password
  })

  return response.data.data
}
