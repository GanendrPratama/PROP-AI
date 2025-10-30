export const getUser = () => {
  try {
    const raw = localStorage.getItem('propai:user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const isLoggedIn = () => !!getUser()

export const logout = () => {
  try {
    localStorage.removeItem('propai:user')
  } catch {}
}
