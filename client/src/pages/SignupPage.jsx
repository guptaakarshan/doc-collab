import { useNavigate } from 'react-router-dom'
import Signup from '../components/Auth/Signup'
import { useAuth } from '../context/AuthContext'

export default function SignupPage() {
	const navigate = useNavigate()
	const { signup } = useAuth()

	const handleSignup = async (payload) => {
		await signup(payload)
		navigate('/')
	}

	return <Signup onSubmit={handleSignup} />
}
