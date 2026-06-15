import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    user: null,
    token: localStorage.getItem('authToken') || null,
    isAuthenticated: !!localStorage.getItem('authToken'),
    loading: false,
    error: null
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginUser: (state, action) => {
            state.user = action.payload.user
            state.token = action.payload.token
            state.isAuthenticated = true
            state.loading = false
            state.error = null
        },
        logoutUser: (state) => {
            state.user = null
            state.token = null
            state.isAuthenticated = false
            state.loading = false
            state.error = null
            localStorage.removeItem('authToken')
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
            state.loading = false
        },
        clearError: (state) => {
            state.error = null
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload }
        }
    }
})

export const {
    loginUser,
    logoutUser,
    setLoading,
    setError,
    clearError,
    updateUser
} = authSlice.actions

export default authSlice.reducer
