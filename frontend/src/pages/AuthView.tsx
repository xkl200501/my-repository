import { useState } from 'react'
import { NavigateFunction, useSearchParams } from 'react-router-dom'
import { BookOpen, Eye, EyeOff, Mail, Lock, User as UserIcon, Building, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { toast } from 'sonner'
import { apiService } from '@/lib/api'
import type { User } from '@shared/types/api'
import { COLLEGES } from '@/config/constants'

interface AuthViewProps {
  onAuthSuccess: (user: User, token: string) => void
  onNavigate: NavigateFunction
}

export default function AuthView({ onAuthSuccess, onNavigate }: AuthViewProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'login'
  const isLogin = mode === 'login'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [college, setCollege] = useState('')
  const [major, setMajor] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error('请填写邮箱和密码')
      return
    }
    if (!isLogin && !name.trim()) {
      toast.error('请填写姓名')
      return
    }

    setLoading(true)
    try {
      if (isLogin) {
        const res = await apiService.login({ email: email.trim(), password })
        if (res.success) {
          onAuthSuccess(res.data.user as User, res.data.token)
        } else {
          toast.error(res.message || '登录失败')
        }
      } else {
        const res = await apiService.register({
          email: email.trim(),
          password,
          name: name.trim(),
          college: college || undefined,
          major: major.trim() || undefined,
        })
        if (res.success) {
          onAuthSuccess(res.data.user as User, res.data.token)
        } else {
          toast.error(res.message || '注册失败')
        }
      }
    } catch {
      toast.error('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setSearchParams({ mode: isLogin ? 'register' : 'login' })
    setEmail('')
    setPassword('')
    setName('')
    setCollege('')
    setMajor('')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">校园资源共享平台</h1>
          <p className="text-muted-foreground mt-1">
            {isLogin ? '登录你的账号' : '创建新账号'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          {/* Tab switcher */}
          <div className="flex bg-muted rounded-lg p-1 mb-6">
            <button
              onClick={() => setSearchParams({ mode: 'login' })}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                isLogin ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setSearchParams({ mode: 'register' })}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                !isLogin ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name">姓名 *</Label>
                <div className="relative mt-1">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="请输入姓名"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email">学校邮箱 *</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="请输入学校邮箱"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">密码 *</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={isLogin ? '请输入密码' : '至少6个字符'}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <Label>学院（可选）</Label>
                  <Select value={college || 'none'} onValueChange={v => setCollege(v === 'none' ? '' : v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="选择学院" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">不限学院</SelectItem>
                      {COLLEGES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="major">专业（可选）</Label>
                  <div className="relative mt-1">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="major"
                      value={major}
                      onChange={e => setMajor(e.target.value)}
                      placeholder="例如：计算机科学与技术"
                      className="pl-10"
                    />
                  </div>
                </div>
              </>
            )}

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isLogin ? '登录中...' : '注册中...'}
                </span>
              ) : (
                isLogin ? '登录' : '注册'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            {isLogin ? '还没有账号？' : '已有账号？'}
            {' '}
            <button onClick={switchMode} className="text-primary hover:underline font-medium">
              {isLogin ? '立即注册' : '登录'}
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          注册即表示同意平台使用条款，请合法共享学习资源
        </p>
      </div>
    </div>
  )
}
