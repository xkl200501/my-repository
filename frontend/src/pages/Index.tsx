import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import {
  BookOpen, Search, Upload, User, Shield, Menu, X, LogOut,
  Home, Bell, ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { apiService } from '@/lib/api'
import type { User as UserType } from '@shared/types/api'
import HomePage from './HomePage'
import ResourcesView from './ResourcesView'
import ResourceDetailView from './ResourceDetailView'
import UploadView from './UploadView'
import ProfileView from './ProfileView'
import AdminView from './AdminView'
import AuthView from './AuthView'

export default function Index() {
  const [user, setUser] = useState<UserType | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const loadUser = useCallback(async () => {
    try {
      const res = await apiService.getMe()
      if (res.success) setUser(res.data)
      else { setUser(null) }
    } catch {
      setUser(null)
    } finally {
      setLoadingUser(false)
    }
  }, [])

  useEffect(() => { loadUser() }, [loadUser])

  const handleLogout = () => {
    // 由于token存储在cookie中，我们需要通过后端API来清除token
    // 这里直接设置用户为null，后续请求会自动清除cookie
    setUser(null)
    navigate('/')
    toast.success('已退出登录')
  }

  const handleAuthSuccess = (newUser: UserType) => {
    // 由于token存储在cookie中，不需要手动设置token
    setUser(newUser)
    navigate('/')
    toast.success(`欢迎回来，${newUser.name}!`)
  }

  const navLinks = [
    { path: '/', label: '首页', icon: Home },
    { path: '/resources', label: '资源库', icon: BookOpen },
    { path: '/upload', label: '上传资源', icon: Upload },
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 font-bold text-lg text-primary hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="hidden sm:block">校园资源共享</span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </button>
              ))}
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin')
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  管理后台
                </button>
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-primary text-white text-xs">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">{user.name}</span>
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="w-4 h-4 mr-2" />个人中心
                    </DropdownMenuItem>
                    {user.role === 'admin' && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Shield className="w-4 h-4 mr-2" />管理后台
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />退出登录
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate('/auth?mode=login')}>
                    登录
                  </Button>
                  <Button size="sm" onClick={() => navigate('/auth?mode=register')}>
                    注册
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(link => (
                <button
                  key={link.path}
                  onClick={() => { navigate(link.path); setMobileMenuOpen(false) }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </button>
              ))}
              {user?.role === 'admin' && (
                <button
                  onClick={() => { navigate('/admin'); setMobileMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Shield className="w-4 h-4" />管理后台
                </button>
              )}
              {user && (
                <button
                  onClick={() => { navigate('/profile'); setMobileMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
                >
                  <User className="w-4 h-4" />个人中心
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage user={user} onNavigate={navigate} />} />
          <Route path="/resources" element={<ResourcesView user={user} onNavigate={navigate} />} />
          <Route path="/resources/:id" element={<ResourceDetailView user={user} onNavigate={navigate} />} />
          <Route path="/upload" element={<UploadView user={user} onNavigate={navigate} />} />
          <Route path="/profile" element={<ProfileView user={user} onUserUpdate={setUser} onNavigate={navigate} />} />
          <Route path="/admin" element={<AdminView user={user} onNavigate={navigate} />} />
          <Route path="/auth" element={<AuthView onAuthSuccess={handleAuthSuccess} onNavigate={navigate} />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <BookOpen className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-foreground">校园资源共享平台</span>
            </div>
            <p className="text-xs text-muted-foreground">促进知识共享，提升学习效率 &copy; 2026</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
