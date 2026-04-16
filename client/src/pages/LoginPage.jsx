import { useNavigate } from 'react-router-dom'
import Login from '../components/Auth/Login'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
	const navigate = useNavigate()
	const { login } = useAuth()

	const handleLogin = async (credentials) => {
		await login(credentials)
		navigate('/')
	}

	return <Login onSubmit={handleLogin} />
}
