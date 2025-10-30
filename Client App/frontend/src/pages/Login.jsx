import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NavBar from '../NavBar'
import Footer from '../Footer'

export default function Login() {
	const navigate = useNavigate()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const onSubmit = async (e) => {
		e.preventDefault()
		setError('')
		if (!email || !password) {
			setError('Please fill in all fields')
			return
		}
		setLoading(true)
		try {
			// Placeholder: fake login
			await new Promise((r) => setTimeout(r, 600))
			localStorage.setItem('propai:user', JSON.stringify({ email }))
			navigate('/')
		} catch (e) {
			setError('Login failed. Try again.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="flex flex-col min-h-screen bg-gray-50">
			<NavBar />
			<main className="flex-1 px-0 py-6 md:py-10">
				<div className="w-full bg-white border-t md:border rounded-none md:rounded-none shadow-sm p-6">
					<h1 className="text-2xl font-bold text-[#395192] mb-1">Welcome back</h1>
					<p className="text-gray-600 mb-6">Sign in to your account</p>
					<form onSubmit={onSubmit} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#395192]"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#395192]"
							/>
						</div>
						{error ? <p className="text-sm text-red-600">{error}</p> : null}
						<button type="submit" disabled={loading} className="w-full bg-[#8F333E] text-white py-2 rounded-md hover:opacity-90 disabled:opacity-60">{loading ? 'Signing in…' : 'Sign In'}</button>
					</form>
					<p className="text-sm text-gray-600 mt-4">Don't have an account? <Link className="text-[#395192] font-medium" to="/register">Create one</Link></p>
				</div>
			</main>
			<Footer />
		</div>
	)
}

