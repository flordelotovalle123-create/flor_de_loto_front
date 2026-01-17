import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/pages/Login.scss";
import { useNavigate } from "react-router-dom";
import logo from '@/assets/logo/Flor_de_loto.jpg'

export default function Login() {
const { login } = useAuth()
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const navigate = useNavigate()

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  try {
    await login(email, password)
    navigate('/mesas')
  } catch (error) {
    alert('credenciales invalidas')
  }
}



return (
  <div className="login-page">
    <div className="login-card">

      <img src={logo} alt="flor de loto" className="login-logo" />
      
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          placeholder="correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">ingresar</button>
      </form>
    </div>
  </div>
);
}