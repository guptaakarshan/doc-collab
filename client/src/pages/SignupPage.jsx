import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Signup from '../components/Auth/Signup'
import { useAuth } from '../context/useAuth'

export default function SignupPage() {
	const navigate = useNavigate()
	const { signup } = useAuth()

	const handleSignup = async (payload) => {
		await signup(payload)
		toast.success('Account created successfully')
		navigate('/')
	}

	return <Signup onSubmit={handleSignup} />
}
