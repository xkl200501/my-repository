import { useState, useEffect, useCallback } from 'react'
import { NavigateFunction } from 'react-router-dom'
import {
  User, BookOpen, Bookmark, Upload, Edit, Save, X,
  Download, Heart, Star, Calendar, Building, GraduationCap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { toast } from 'sonner'
import { apiService } from '@/lib/api'
import type { User as UserType, Resource } from '@shared/types/api'
import { COLLEGES, RESOURCE_TYPE_LABELS } from '@/config/constants'

interface ProfileViewProps {
  user: UserType | null
  onUserUpdate: (user: UserType) => void
  onNavigate: NavigateFunction
}

const typeColors: Record<string, string> = {
  courseware: 'bg-blue-50 text-blue-700',
  notes: 'bg-green-50 text-green-700',
  exam: 'bg-orange-50 text-orange-700',
  assignment: 'bg-purple-50 text-purple-700',
  other: 'bg-gray-50 text-gray-700',
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function ProfileView({ user, onUserUpdate, onNavigate }: ProfileViewProps) {
  const [myResources, setMyResources] = useState<Resource[]>([])
  const [favorites, setFavorites] = useState<Resource[]>([])
  const [loadingResources, setLoadingResources] = useState(true)
  const [loadingFavorites, setLoadingFavorites] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

  const [name, setName] = useState(user?.name || '')
  const [college, setCollege] = useState(user?.college || '')
  const [major, setMajor] = useState(user?.major || '')
  const [bio, setBio] = useState(user?.bio || '')

  const loadData = useCallback(async () => {
    if (!user) return
    setLoadingResources(true)
    setLoadingFavorites(true)
    try {
      const [myRes, favRes] = await Promise.all([
        apiService.getMyResources(),
        apiService.getMyFavorites(),
      ])
      if (myRes.success) setMyResources(myRes.data)
      if (favRes.success) setFavorites(favRes.data)
    } catch {
      // ignore
    } finally {
      setLoadingResources(false)
      setLoadingFavorites(false)
    }
  }, [user])

  useEffect(() => { loadData() }, [loadData])

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-xl font-bold text-foreground mb-2">请先登录</h2>
        <Button onClick={() => onNavigate('/auth?mode=login')}>去登录</Button>
      </div>
    )
  }

  const handleSaveProfile = async () => {
    if (!name.trim()) { toast.error('姓名不能为空'); return }
    setSavingProfile(true)
    try {
      const res = await apiService.updateProfile({ name: name.trim(), college, major, bio })
      if (res.success) {
        onUserUpdate(res.data as UserType)
        setEditingProfile(false)
        toast.success('个人信息已更新')
      }
    } catch {
      toast.error('更新失败')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleDeleteResource = async (resourceId: string) => {
    if (!window.confirm('确定要删除这份资源吗？')) return
    try {
      await apiService.deleteResource(resourceId)
      setMyResources(prev => prev.filter(r => r.id !== resourceId))
      toast.success('资源已删除')
    } catch {
      toast.error('删除失败')
    }
  }

  const ResourceMiniCard = ({ resource, showDelete = false }: { resource: Resource; showDelete?: boolean }) => (
    <div className="bg-white rounded-xl border border-border p-4 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[resource.resourceType] || typeColors.other}`}>
          {RESOURCE_TYPE_LABELS[resource.resourceType] || resource.resourceType}
        </span>
        <div className="flex items-center gap-1">
          {showDelete && (
            <>
              <button
                onClick={() => onNavigate(`/upload?edit=${resource.id}`)}
                className="p-1 text-muted-foreground hover:text-primary transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDeleteResource(resource.id)}
                className="p-1 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
      <h3
        className="font-medium text-foreground text-sm leading-tight line-clamp-2 mb-2 cursor-pointer hover:text-primary transition-colors"
        onClick={() => onNavigate(`/resources/${resource.id}`)}
      >
        {resource.title}
      </h3>
      {resource.course && (
        <p className="text-xs text-muted-foreground mb-2 truncate">{resource.course}</p>
      )}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Download className="w-3 h-3" />{resource.downloadCount}</span>
        <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{resource.likeCount}</span>
        {resource.rating > 0 && (
          <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{resource.rating.toFixed(1)}</span>
        )}
        <span className="ml-auto">{formatDate(resource.createdAt)}</span>
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <Avatar className="w-20 h-20 mb-3">
                <AvatarFallback className="bg-primary text-white text-2xl">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {!editingProfile ? (
                <>
                  <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                  {user.college && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Building className="w-3.5 h-3.5" />{user.college}
                    </div>
                  )}
                  {user.major && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <GraduationCap className="w-3.5 h-3.5" />{user.major}
                    </div>
                  )}
                  {user.bio && (
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{user.bio}</p>
                  )}
                  <Badge className="mt-3" variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role === 'admin' ? '管理员' : user.role === 'teacher' ? '教师' : '学生'}
                  </Badge>
                </>
              ) : (
                <div className="w-full text-left space-y-3">
                  <div>
                    <Label>姓名</Label>
                    <Input value={name} onChange={e => setName(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>学院</Label>
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
                    <Label>专业</Label>
                    <Input value={major} onChange={e => setMajor(e.target.value)} placeholder="例如：计算机科学与技术" className="mt-1" />
                  </div>
                  <div>
                    <Label>个人简介</Label>
                    <Textarea value={bio} onChange={e => setBio(e.target.value)} className="mt-1 resize-none" rows={3} />
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center bg-muted/50 rounded-lg p-3">
                <div className="text-xl font-bold text-foreground">{myResources.length}</div>
                <div className="text-xs text-muted-foreground">上传资源</div>
              </div>
              <div className="text-center bg-muted/50 rounded-lg p-3">
                <div className="text-xl font-bold text-foreground">{favorites.length}</div>
                <div className="text-xs text-muted-foreground">收藏资源</div>
              </div>
            </div>

            {/* Actions */}
            {!editingProfile ? (
              <Button variant="outline" className="w-full gap-2" onClick={() => setEditingProfile(true)}>
                <Edit className="w-4 h-4" />编辑个人信息
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button className="flex-1 gap-2" onClick={handleSaveProfile} disabled={savingProfile}>
                  <Save className="w-4 h-4" />{savingProfile ? '保存中...' : '保存'}
                </Button>
                <Button variant="outline" onClick={() => {
                  setEditingProfile(false)
                  setName(user.name)
                  setCollege(user.college || '')
                  setMajor(user.major || '')
                  setBio(user.bio || '')
                }}>
                  取消
                </Button>
              </div>
            )}

            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground justify-center">
              <Calendar className="w-3 h-3" />
              加入于 {formatDate(user.createdAt)}
            </div>
          </div>
        </div>

        {/* Resources Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="uploads">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="uploads" className="flex-1 gap-2">
                <Upload className="w-4 h-4" />我的上传 ({myResources.length})
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex-1 gap-2">
                <Bookmark className="w-4 h-4" />我的收藏 ({favorites.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="uploads">
              {loadingResources ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-border p-4 animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                      <div className="h-5 bg-muted rounded w-full mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : myResources.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-border">
                  <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-3">还没有上传任何资源</p>
                  <Button size="sm" onClick={() => onNavigate('/upload')}>上传第一份资源</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myResources.map(r => (
                    <ResourceMiniCard key={r.id} resource={r} showDelete />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="favorites">
              {loadingFavorites ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-border p-4 animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                      <div className="h-5 bg-muted rounded w-full mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-border">
                  <Bookmark className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-3">还没有收藏任何资源</p>
                  <Button size="sm" variant="outline" onClick={() => onNavigate('/resources')}>浏览资源库</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favorites.map(r => (
                    <ResourceMiniCard key={r.id} resource={r} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
