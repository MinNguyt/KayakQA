import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
    CButton,
    CCard,
    CCardBody,
    CCol,
    CContainer,
    CForm,
    CFormInput,
    CRow,
    CAlert,
    CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilArrowRight } from '@coreui/icons'
import { loginUser } from '../../store/authSlice'
import { authAPI } from '../../lib/Api'

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (error) setError('')
    }

    const handleSubmit = async (e) => {
        e?.preventDefault()
        setLoading(true)
        setError('')
        try {
            const response = await authAPI.login(formData)
            console.log("res", response);
            if (response.email || response.role) {
                localStorage.setItem('authToken', response.token)
                dispatch(loginUser({ user: response.user, token: response.token }))
                navigate('/dashboard')
            } else {
                setError(response.message || 'Đăng nhập thất bại')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
        } finally {
            setLoading(false)
        }
    }

    const styles = {
        wrapper: {
            width: '100%',
            maxWidth: '100%',
            minHeight: '100vh',
            display: 'flex',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)',
            fontFamily: "'Segoe UI', 'Roboto', -apple-system, sans-serif",
        },
        leftPanel: {
            flex: '1.2',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px',
            position: 'relative',
            color: '#fff',
        },
        decoration1: {
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.12) 0%, transparent 70%)',
            top: '-150px',
            left: '-150px',
        },
        decoration2: {
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%)',
            bottom: '-100px',
            right: '50px',
        },
        brandContent: {
            position: 'relative',
            zIndex: 1,
        },
        logoContainer: {
            width: '72px',
            height: '72px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
            fontSize: '32px',
            boxShadow: '0 12px 40px rgba(249, 115, 22, 0.35)',
        },
        brandTitle: {
            fontSize: '42px',
            fontWeight: '700',
            marginBottom: '16px',
            lineHeight: '1.2',
            letterSpacing: '-0.5px',
        },
        brandHighlight: {
            background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
        },
        brandDesc: {
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: '1.7',
            maxWidth: '420px',
            marginBottom: '48px',
        },
        statGrid: {
            display: 'flex',
            gap: '40px',
        },
        statItem: {
            textAlign: 'left',
        },
        statValue: {
            fontSize: '32px',
            fontWeight: '700',
            color: '#f97316',
            marginBottom: '4px',
        },
        statLabel: {
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.6)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
        },
        rightPanel: {
            flex: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            marginTop: '6%'
        },
        loginCard: {
            width: '100%',
            maxWidth: '440px',
            border: 'none',
            borderRadius: '24px',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4)',
            overflow: 'hidden',
        },
        cardBody: {
            padding: '48px',
            background: '#fff',
        },
        welcomeLabel: {
            fontSize: '14px',
            color: '#94a3b8',
            fontWeight: '500',
            marginBottom: '8px',
        },
        formTitle: {
            fontSize: '28px',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '8px',
        },
        formSubtitle: {
            fontSize: '15px',
            color: '#64748b',
            marginBottom: '32px',
        },
        inputGroup: {
            marginBottom: '24px',
        },
        inputLabel: {
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#334155',
            marginBottom: '8px',
        },
        inputWrapper: {
            position: 'relative',
        },
        inputIcon: {
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            width: '20px',
            height: '20px',
        },
        formInput: {
            width: '100%',
            padding: '14px 16px 14px 48px',
            fontSize: '15px',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            outline: 'none',
            transition: 'all 0.2s ease',
            background: '#fff',
        },
        passwordToggle: {
            position: 'absolute',
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
        },
        loginButton: {
            width: '100%',
            padding: '16px',
            fontSize: '16px',
            fontWeight: '600',
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
        },
        forgotLink: {
            display: 'block',
            textAlign: 'center',
            marginTop: '24px',
            fontSize: '14px',
            color: '#64748b',
            textDecoration: 'none',
        },
        securityNote: {
            marginTop: '32px',
            padding: '16px',
            background: '#f8fafc',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        },
        securityIcon: {
            fontSize: '24px',
        },
        securityText: {
            fontSize: '13px',
            color: '#64748b',
            lineHeight: '1.5',
        },
    }

    return (

        <>
            < div style={styles.rightPanel} >
                <CCard style={styles.loginCard}>
                    <CCardBody style={styles.cardBody}>
                        <p style={styles.welcomeLabel}>Chào mừng trở lại</p>
                        <h2 style={styles.formTitle}>Đăng nhập Admin</h2>
                        <p style={styles.formSubtitle}>Truy cập bảng điều khiển quản trị hệ thống</p>

                        {error && (
                            <CAlert color="danger" dismissible onClose={() => setError('')}
                                style={{ borderRadius: '12px', marginBottom: '24px' }}>
                                {error}
                            </CAlert>
                        )}

                        <CForm onSubmit={handleSubmit}>
                            <div style={styles.inputGroup}>
                                <label style={styles.inputLabel}>Email</label>
                                <div style={styles.inputWrapper}>
                                    <CIcon icon={cilUser} style={styles.inputIcon} />
                                    <CFormInput
                                        name="email"
                                        type="email"
                                        placeholder="admin@buscompany.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        style={styles.formInput}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.inputLabel}>Mật khẩu</label>
                                <div style={styles.inputWrapper}>
                                    <CIcon icon={cilLockLocked} style={styles.inputIcon} />
                                    <CFormInput
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Nhập mật khẩu"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        style={{ ...styles.formInput, paddingRight: '80px' }}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
                                        {showPassword ? '🙈 Ẩn' : '👁️ Hiện'}
                                    </button>
                                </div>
                            </div>

                            <CButton type="submit" disabled={loading} style={{ ...styles.loginButton, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                                {loading ? (<><CSpinner size="sm" /> Đang đăng nhập...</>) : (<>Đăng nhập <CIcon icon={cilArrowRight} /></>)}
                            </CButton>
                        </CForm>



                        <div style={styles.securityNote}>
                            <span style={styles.securityIcon}>🔒</span>
                            <span style={styles.securityText}>Kết nối được bảo mật bằng SSL. Thông tin đăng nhập được mã hóa.</span>
                        </div>
                    </CCardBody>
                </CCard>
            </div >
        </>



    )
}

export default Login
