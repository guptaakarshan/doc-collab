import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Login from '../components/Auth/Login'
import { useAuth } from '../context/useAuth'

export default function LoginPage() {
	const navigate = useNavigate()
	const { login } = useAuth()

	const handleLogin = async (credentials) => {
		await login(credentials)
		toast.success('Logged in successfully')
		navigate('/')
	}

	return <Login onSubmit={handleLogin} />
}
