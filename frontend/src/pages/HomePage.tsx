import { useState, useEffect } from 'react'
import { NavigateFunction } from 'react-router-dom'
import {
  Search, BookOpen, FileText, GraduationCap, ClipboardList, Upload,
  Download, Star, Heart, TrendingUp, Users, Database, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { apiService } from '@/lib/api'
import type { User, Resource } from '@shared/types/api'
import { RESOURCE_TYPE_LABELS } from '@/config/constants'

interface HomePageProps {
  user: User | null
  onNavigate: NavigateFunction
}

function ResourceCard({ resource, onNavigate }: { resource: Resource; onNavigate: NavigateFunction }) {
  const typeColors: Record<string, string> = {
    courseware: 'bg-blue-50 text-blue-700',
    notes: 'bg-green-50 text-green-700',
    exam: 'bg-orange-50 text-orange-700',
    assignment: 'bg-purple-50 text-purple-700',
    other: 'bg-gray-50 text-gray-700',
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  return (
    <div
      className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-all cursor-pointer group flex flex-col min-h-[160px]"
      onClick={() => onNavigate(`/resources/${resource.id}`)}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[resource.resourceType] || typeColors.other}`}>
          {RESOURCE_TYPE_LABELS[resource.resourceType] || resource.resourceType}
        </span>
        {resource.college && (
          <span className="text-xs text-muted-foreground truncate max-w-[120px]">{resource.college}</span>
        )}
      </div>
      <h3 className="font-semibold text-foreground leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors flex-1">
        {resource.title}
      </h3>
      {resource.course && (
        <p className="text-xs text-muted-foreground mb-3 truncate">{resource.course}</p>
      )}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" />{resource.downloadCount}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />{resource.likeCount}
          </span>
          {resource.rating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{resource.rating.toFixed(1)}
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{formatSize(resource.fileSize)}</span>
      </div>
    </div>
  )
}

export default function HomePage({ user, onNavigate }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [featuredResources, setFeaturedResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiService.getFeaturedResources()
        if (res.success) setFeaturedResources(res.data)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onNavigate(`/resources?keyword=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      onNavigate('/resources')
    }
  }

  const categories = [
    { icon: BookOpen, label: '课件', type: 'courseware', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100', count: '2,341' },
    { icon: FileText, label: '笔记', type: 'notes', color: 'bg-green-50 text-green-600 hover:bg-green-100', count: '1,892' },
    { icon: GraduationCap, label: '历年试卷', type: 'exam', color: 'bg-orange-50 text-orange-600 hover:bg-orange-100', count: '3,156' },
    { icon: ClipboardList, label: '作业', type: 'assignment', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100', count: '987' },
  ]

  const stats = [
    { icon: Database, label: '资源总数', value: '10,000+', color: 'text-blue-600' },
    { icon: Users, label: '活跃用户', value: '5,000+', color: 'text-green-600' },
    { icon: Download, label: '总下载次数', value: '50,000+', color: 'text-orange-600' },
    { icon: TrendingUp, label: '满意率', value: '75%', color: 'text-purple-600' },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/20">
        <div className="absolute inset-0 opacity-5">
          <img
            src="https://images.unsplash.com/photo-1769092992447-18050cf9bd26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
              校园学习资源共享平台
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
              一起共享知识，
              <span className="text-primary">提升学习效率</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed">
              集中化的校园学习资源库，课件、笔记、历年试卷一站式获取。
              让每一份优质资源都能发挥最大价値。
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="搜索课程名称、资源类型..."
                  className="pl-10 h-12 text-base bg-white border-border"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6">
                搜索
              </Button>
            </form>

            {!user && (
              <div className="flex items-center gap-3 mt-6">
                <Button onClick={() => onNavigate('/auth?mode=register')} className="gap-2">
                  <Upload className="w-4 h-4" />立即加入
                </Button>
                <Button variant="outline" onClick={() => onNavigate('/resources')} className="gap-2">
                  浏览资源 <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map(stat => (
              <div key={stat.label} className="text-center">
                <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">按类型浏览</h2>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('/resources')} className="gap-1 text-primary">
            查看全部 <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map(cat => (
            <button
              key={cat.type}
              onClick={() => onNavigate(`/resources?resourceType=${cat.type}`)}
              className={`flex flex-col items-center gap-3 p-6 rounded-xl border border-border transition-all hover:shadow-md ${cat.color}`}
            >
              <cat.icon className="w-8 h-8" />
              <div>
                <div className="font-semibold text-sm">{cat.label}</div>
                <div className="text-xs opacity-70 mt-0.5">{cat.count} 份</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Resources */}
      <section className="bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">热门资源</h2>
              <p className="text-sm text-muted-foreground mt-1">最多人下载的优质内容</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('/resources?sortBy=popular')} className="gap-1 text-primary">
              查看更多 <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-border p-5 animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                  <div className="h-5 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : featuredResources.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredResources.map(resource => (
                <ResourceCard key={resource.id} resource={resource} onNavigate={onNavigate} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-border">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">暂无资源，成为第一个上传者吧！</p>
              <Button className="mt-4" onClick={() => onNavigate('/upload')}>
                上传资源
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="bg-primary rounded-2xl p-8 sm:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">加入我们，共建学习社区</h2>
            <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
              上传你的学习资源，帮助更多同学。注册即可免费获取平台全部资源。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => onNavigate('/auth?mode=register')}
                className="bg-white text-primary hover:bg-white/90"
              >
                免费注册
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate('/resources')}
                className="border-white/40 text-white hover:bg-white/10"
              >
                浏览资源
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
