import { useState, useEffect, useCallback } from 'react'
import { NavigateFunction } from 'react-router-dom'
import {
  Shield, Users, Database, Download, AlertTriangle, CheckCircle,
  XCircle, Clock, Eye, Trash2, Flag, BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { apiService } from '@/lib/api'
import type { User, Resource, Report } from '@shared/types/api'
import { RESOURCE_TYPE_LABELS } from '@/config/constants'

interface AdminViewProps {
  user: User | null
  onNavigate: NavigateFunction
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function AdminView({ user, onNavigate }: AdminViewProps) {
  const [stats, setStats] = useState<{
    totalUsers: number
    totalResources: number
    pendingResources: number
    pendingReports: number
    totalDownloads: number
  } | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const loadData = useCallback(async () => {
    if (!user || user.role !== 'admin') return
    setLoading(true)
    try {
      const [statsRes, resourcesRes, reportsRes] = await Promise.all([
        apiService.getAdminStats(),
        apiService.getAdminResources(),
        apiService.getAdminReports(),
      ])
      if (statsRes.success) setStats(statsRes.data)
      if (resourcesRes.success) setResources(resourcesRes.data)
      if (reportsRes.success) setReports(reportsRes.data)
    } catch {
      toast.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { loadData() }, [loadData])

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-xl font-bold text-foreground mb-2">无权限访问</h2>
        <p className="text-muted-foreground mb-4">需要管理员权限才能访问此页面</p>
        <Button onClick={() => onNavigate('/')}>返回首页</Button>
      </div>
    )
  }

  const handleApprove = async (id: string) => {
    try {
      await apiService.approveResource(id)
      setResources(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r))
      toast.success('资源已审核通过')
    } catch {
      toast.error('操作失败')
    }
  }

  const handleReject = async (id: string) => {
    try {
      await apiService.rejectResource(id)
      setResources(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r))
      toast.success('资源已拒绝')
    } catch {
      toast.error('操作失败')
    }
  }

  const handleDeleteResource = async (id: string) => {
    if (!window.confirm('确定要删除这份资源吗？')) return
    try {
      await apiService.deleteResource(id)
      setResources(prev => prev.filter(r => r.id !== id))
      toast.success('资源已删除')
    } catch {
      toast.error('删除失败')
    }
  }

  const handleResolveReport = async (id: string) => {
    try {
      await apiService.resolveReport(id, 'resolve')
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r))
      toast.success('举报已处理')
    } catch {
      toast.error('操作失败')
    }
  }

  const handleDismissReport = async (id: string) => {
    try {
      await apiService.resolveReport(id, 'dismiss')
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'dismissed' } : r))
      toast.success('举报已忽略')
    } catch {
      toast.error('操作失败')
    }
  }

  const pendingResources = resources.filter(r => r.status === 'pending')
  const pendingReports = reports.filter(r => r.status === 'pending')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />管理后台
        </h1>
        <p className="text-muted-foreground text-sm mt-1">内容审核与平台管理</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />数据概览
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-2">
            <Database className="w-4 h-4" />资源管理
            {pendingResources.length > 0 && (
              <Badge className="ml-1 bg-orange-500 text-white text-xs px-1.5 py-0">{pendingResources.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <Flag className="w-4 h-4" />举报管理
            {pendingReports.length > 0 && (
              <Badge className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0">{pendingReports.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-border p-6 animate-pulse">
                  <div className="h-8 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl border border-border p-5 text-center">
                <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stats.totalUsers}</div>
                <div className="text-sm text-muted-foreground">注册用户</div>
              </div>
              <div className="bg-white rounded-xl border border-border p-5 text-center">
                <Database className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stats.totalResources}</div>
                <div className="text-sm text-muted-foreground">资源总数</div>
              </div>
              <div className="bg-white rounded-xl border border-border p-5 text-center">
                <Download className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stats.totalDownloads}</div>
                <div className="text-sm text-muted-foreground">总下载次数</div>
              </div>
              <div className="bg-white rounded-xl border border-border p-5 text-center">
                <Clock className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stats.pendingResources}</div>
                <div className="text-sm text-muted-foreground">待审核资源</div>
              </div>
              <div className="bg-white rounded-xl border border-border p-5 text-center">
                <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stats.pendingReports}</div>
                <div className="text-sm text-muted-foreground">待处理举报</div>
              </div>
            </div>
          ) : null}

          {/* Quick actions */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pendingResources.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-orange-800">{pendingResources.length} 份资源待审核</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => setActiveTab('resources')} className="border-orange-300 text-orange-700 hover:bg-orange-100">
                  前往审核
                </Button>
              </div>
            )}
            {pendingReports.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-800">{pendingReports.length} 举报待处理</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => setActiveTab('reports')} className="border-red-300 text-red-700 hover:bg-red-100">
                  前往处理
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Resources Management */}
        <TabsContent value="resources">
          <div className="space-y-3">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-border p-4 animate-pulse">
                  <div className="h-5 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/3" />
                </div>
              ))
            ) : resources.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-border">
                <Database className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">暂无资源</p>
              </div>
            ) : (
              resources.map(resource => (
                <div key={resource.id} className="bg-white rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium text-foreground truncate">{resource.title}</span>
                        <Badge
                          variant={resource.status === 'approved' ? 'default' : resource.status === 'rejected' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {resource.status === 'approved' ? '已审核' : resource.status === 'rejected' ? '已拒绝' : '待审核'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {RESOURCE_TYPE_LABELS[resource.resourceType] || resource.resourceType}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>上传者: {resource.uploaderName}</span>
                        {resource.college && <span>{resource.college}</span>}
                        <span>{formatDate(resource.createdAt)}</span>
                        <span>下载: {resource.downloadCount}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onNavigate(`/resources/${resource.id}`)}
                        className="text-muted-foreground"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {resource.status !== 'approved' && (
                        <Button size="sm" variant="outline" onClick={() => handleApprove(resource.id)} className="text-green-600 border-green-200 hover:bg-green-50">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      {resource.status !== 'rejected' && (
                        <Button size="sm" variant="outline" onClick={() => handleReject(resource.id)} className="text-orange-600 border-orange-200 hover:bg-orange-50">
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleDeleteResource(resource.id)} className="text-destructive border-destructive/20 hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Reports Management */}
        <TabsContent value="reports">
          <div className="space-y-3">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-border p-4 animate-pulse">
                  <div className="h-5 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/3" />
                </div>
              ))
            ) : reports.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-border">
                <Flag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">暂无举报</p>
              </div>
            ) : (
              reports.map(report => (
                <div key={report.id} className="bg-white rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{report.resourceTitle}</span>
                        <Badge
                          variant={report.status === 'pending' ? 'secondary' : report.status === 'resolved' ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {report.status === 'pending' ? '待处理' : report.status === 'resolved' ? '已处理' : '已忽略'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>举报人: {report.reporterName}</span>
                        <span>原因: {report.reason}</span>
                        <span>{formatDate(report.createdAt)}</span>
                      </div>
                      {report.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{report.description}</p>
                      )}
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button size="sm" variant="outline" onClick={() => handleResolveReport(report.id)} className="text-green-600 border-green-200 hover:bg-green-50 gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />处理
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDismissReport(report.id)} className="text-muted-foreground gap-1">
                          <XCircle className="w-3.5 h-3.5" />忽略
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
