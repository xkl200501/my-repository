import { useState, useEffect, useCallback } from 'react'
import { NavigateFunction, useSearchParams } from 'react-router-dom'
import {
  Search, Filter, SlidersHorizontal, Download, Heart, Star,
  BookOpen, ChevronLeft, ChevronRight, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { apiService } from '@/lib/api'
import type { User, Resource, ResourceType } from '@shared/types/api'
import { COLLEGES, RESOURCE_TYPES, RESOURCE_TYPE_LABELS, SORT_OPTIONS } from '@/config/constants'

interface ResourcesViewProps {
  user: User | null
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

export default function ResourcesView({ user, onNavigate }: ResourcesViewProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [resources, setResources] = useState<Resource[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const keyword = searchParams.get('keyword') || ''
  const college = searchParams.get('college') || ''
  const resourceType = (searchParams.get('resourceType') || '') as ResourceType | ''
  const sortBy = searchParams.get('sortBy') || 'newest'
  const page = Number(searchParams.get('page') || '1')

  const [searchInput, setSearchInput] = useState(keyword)

  const loadResources = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiService.getResources({
        keyword: keyword || undefined,
        college: college || undefined,
        resourceType: resourceType as ResourceType || undefined,
        sortBy: sortBy as 'newest' | 'popular' | 'rating',
        page,
        pageSize: 12,
      })
      if (res.success) {
        setResources(res.data.items)
        setTotal(res.data.total)
        setTotalPages(res.data.totalPages)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [keyword, college, resourceType, sortBy, page])

  useEffect(() => { loadResources() }, [loadResources])

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParam('keyword', searchInput.trim())
  }

  const clearFilters = () => {
    setSearchInput('')
    setSearchParams({})
  }

  const hasFilters = keyword || college || resourceType || sortBy !== 'newest'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">资源库</h1>
        <p className="text-muted-foreground text-sm">共 {total} 份资源</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-border p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="搜索资源名称、课程..."
              className="pl-10"
            />
          </div>
          <Button type="submit">搜索</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">筛选</span>
            {hasFilters && <span className="w-2 h-2 bg-primary rounded-full" />}
          </Button>
        </form>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border">
            <Select value={resourceType || 'none'} onValueChange={v => updateParam('resourceType', v === 'none' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="资源类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">全部类型</SelectItem>
                {RESOURCE_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={college || 'none'} onValueChange={v => updateParam('college', v === 'none' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="选择学院" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">全部学院</SelectItem>
                {COLLEGES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={v => updateParam('sortBy', v)}>
              <SelectTrigger>
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Active filters */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">当前筛选:</span>
            {keyword && (
              <Badge variant="secondary" className="gap-1 text-xs">
                搜索: {keyword}
                <button onClick={() => { setSearchInput(''); updateParam('keyword', '') }}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {resourceType && (
              <Badge variant="secondary" className="gap-1 text-xs">
                {RESOURCE_TYPE_LABELS[resourceType]}
                <button onClick={() => updateParam('resourceType', '')}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {college && (
              <Badge variant="secondary" className="gap-1 text-xs">
                {college}
                <button onClick={() => updateParam('college', '')}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            <button onClick={clearFilters} className="text-xs text-destructive hover:underline ml-1">
              清除全部
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-border p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-3" />
              <div className="h-5 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-2/3 mb-4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-border">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium mb-1">没有找到相关资源</p>
          <p className="text-muted-foreground text-sm mb-4">尝试修改搜索条件或上传新资源</p>
          {user && (
            <Button onClick={() => onNavigate('/upload')}>上传资源</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {resources.map(resource => (
            <div
              key={resource.id}
              className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-all cursor-pointer group flex flex-col min-h-[180px]"
              onClick={() => onNavigate(`/resources/${resource.id}`)}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[resource.resourceType] || typeColors.other}`}>
                  {RESOURCE_TYPE_LABELS[resource.resourceType] || resource.resourceType}
                </span>
                {resource.college && (
                  <span className="text-xs text-muted-foreground truncate max-w-[100px]">{resource.college}</span>
                )}
              </div>
              <h3 className="font-semibold text-foreground leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors flex-1">
                {resource.title}
              </h3>
              {resource.course && (
                <p className="text-xs text-muted-foreground mb-2 truncate">{resource.course}</p>
              )}
              <p className="text-xs text-muted-foreground mb-3">{resource.uploaderName} &middot; {formatDate(resource.createdAt)}</p>
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
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => updateParam('page', String(page - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => updateParam('page', String(page + 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
