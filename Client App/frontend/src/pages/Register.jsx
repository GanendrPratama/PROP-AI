import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NavBar from '../NavBar'
import Footer from '../Footer'
import { registerUser } from '../services/user'

export default function Register() {
	const navigate = useNavigate()
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [phone, setPhone] = useState('')
	const [password, setPassword] = useState('')
	const [confirm, setConfirm] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const onSubmit = async (e) => {
		e.preventDefault()
		setError('')
		if (!name || !email || !phone || !password || !confirm) {
			return setError('Please fill in all fields')
		}
		if (password !== confirm) {
			return setError('Passwords do not match')
		}
		if (password.length < 6) {
			return setError('Password must be at least 6 characters')
		}
		
		setLoading(true)
		try {
			const result = await registerUser({
				full_name: name,
				email,
				phone_number: phone,
				password
			})
			
			if (result.success) {
				alert('Registration successful! Please login.')
				navigate('/login')
			} else {
				setError(result.message || 'Registration failed')
			}
		} catch (err) {
			setError(err.message || 'Registration failed. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="flex flex-col min-h-screen bg-gray-50 w-full">
			<NavBar />
			<main className="flex-1 px-0 py-6 md:py-10">
				<div className="w-full bg-white border-t md:border rounded-none md:rounded-none shadow-sm p-6">
					<h1 className="text-2xl font-bold text-[#395192] mb-1">Create your account</h1>
					<p className="text-gray-600 mb-6">Join PROP-AI to get started</p>
					<form onSubmit={onSubmit} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#395192]"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#395192]"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
							<input
								type="tel"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#395192]"
								placeholder="e.g., 08123456789"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#395192]"
								minLength="6"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
							<input
								type="password"
								value={confirm}
								onChange={(e) => setConfirm(e.target.value)}
								className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#395192]"
								minLength="6"
								required
							/>
						</div>
						{error ? <p className="text-sm text-red-600">{error}</p> : null}
						<button type="submit" disabled={loading} className="w-full bg-[#8F333E] text-white py-2 rounded-md hover:opacity-90 disabled:opacity-60">{loading ? 'Creating account…' : 'Create Account'}</button>
					</form>
					<p className="text-sm text-gray-600 mt-4">Already have an account? <Link className="text-[#395192] font-medium" to="/login">Sign in</Link></p>
				</div>
			</main>
			<Footer />
		</div>
	)
}

