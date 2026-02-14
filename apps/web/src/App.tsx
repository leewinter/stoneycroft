import { ConfigProvider } from 'antd'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import AuthForm from './components/auth/AuthForm'
import AuthHero from './components/auth/AuthHero'
import VerifyPanel from './components/auth/VerifyPanel'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import SettingsPage from './pages/SettingsPage'
import DynamicPage from './pages/DynamicPage'
import HomePage from './pages/HomePage'

export default function App() {
  const {
    email,
    isLoading,
    isMagic,
    status,
    statusTone,
    user,
    setEmail,
    requestLink,
    logout
  } = useAuth()
  const { themeKey, themeConfig, setTheme } = useTheme()
  const authPanel = isMagic ? (
    <VerifyPanel isLoading={isLoading} status={status} />
  ) : (
    <AuthForm
      email={email}
      isLoading={isLoading}
      status={status}
      statusTone={statusTone}
      onEmailChange={setEmail}
      onSubmit={requestLink}
    />
  )

  if (user && !isMagic) {
    return (
      <ConfigProvider theme={themeConfig}>
        <div className="page page-full">
          <AppShell
            userEmail={user.email}
            isLoading={isLoading}
            onSignOut={logout}
            themeKey={themeKey}
            onThemeChange={setTheme}
          >
            <Routes>
              <Route path="/" element={<HomePage showSignIn={false} />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/page/:pageId" element={<DynamicPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppShell>
        </div>
      </ConfigProvider>
    )
  }

  return (
    <ConfigProvider theme={themeConfig}>
      <div className="page">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthHero>{authPanel}</AuthHero>} />
          <Route path="/magic" element={<AuthHero>{authPanel}</AuthHero>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ConfigProvider>
  )
}
