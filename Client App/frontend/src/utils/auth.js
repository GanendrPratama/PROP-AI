export const getUser = () => {
  try {
    const raw = localStorage.getItem('propai:user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const setUser = (user) => {
  try {
    console.log('setUser called with:', user)
    localStorage.setItem('propai:user', JSON.stringify(user))
    console.log('User saved to localStorage')
    // Dispatch custom event to notify components of login
    window.dispatchEvent(new Event('userLoggedIn'))
    console.log('userLoggedIn event dispatched')
  } catch (error) {
    console.error('Failed to save user to localStorage:', error)
  }
}

export const isLoggedIn = () => !!getUser()

export const logout = () => {
  try {
    localStorage.removeItem('propai:user')
    // Dispatch custom event to notify components of logout
    window.dispatchEvent(new Event('userLoggedOut'))
  } catch {}
}
