import { useState, useEffect, useCallback } from 'react'
import { NavigateFunction, useParams } from 'react-router-dom'
import {
  ArrowLeft, Download, Heart, Star, Bookmark, Flag, Trash2,
  Edit, FileText, Calendar, User, Building, Tag, MessageSquare,
  Send, BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { toast } from 'sonner'
import { apiService } from '@/lib/api'
import type { User as UserType, Resource, Comment } from '@shared/types/api'
import { RESOURCE_TYPE_LABELS } from '@/config/constants'

interface ResourceDetailViewProps {
  user: UserType | null
  onNavigate: NavigateFunction
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

export default function ResourceDetailView({ user, onNavigate }: ResourceDetailViewProps) {
  const { id } = useParams<{ id: string }>()
  const [resource, setResource] = useState<Resource | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDesc, setReportDesc] = useState('')
  const [submittingReport, setSubmittingReport] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)

  const loadResource = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const [resResult, commentsResult] = await Promise.all([
        apiService.getResource(id),
        apiService.getComments(id),
      ])
      if (resResult.success) setResource(resResult.data)
      if (commentsResult.success) setComments(commentsResult.data)
    } catch {
      toast.error('加载资源失败')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadResource() }, [loadResource])

  const handleDownload = async () => {
    if (!id) return
    setDownloading(true)
    try {
      const res = await apiService.downloadResource(id)
      if (res.success) {
        window.open(res.data.downloadUrl, '_blank')
        setResource(prev => prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : prev)
        toast.success('开始下载')
      }
    } catch {
      toast.error('下载失败')
    } finally {
      setDownloading(false)
    }
  }

  const handleLike = async () => {
    if (!user) { onNavigate('/auth?mode=login'); return }
    if (!id) return
    try {
      const res = await apiService.likeResource(id)
      if (res.success) {
        setResource(prev => prev ? { ...prev, isLiked: res.data.liked, likeCount: res.data.likeCount } : prev)
      }
    } catch {
      toast.error('操作失败')
    }
  }

  const handleFavorite = async () => {
    if (!user) { onNavigate('/auth?mode=login'); return }
    if (!id) return
    try {
      const res = await apiService.favoriteResource(id)
      if (res.success) {
        setResource(prev => prev ? { ...prev, isFavorited: res.data.favorited, favoriteCount: res.data.favoriteCount } : prev)
        toast.success(res.data.favorited ? '已收藏' : '已取消收藏')
      }
    } catch {
      toast.error('操作失败')
    }
  }

  const handleRate = async (rating: number) => {
    if (!user) { onNavigate('/auth?mode=login'); return }
    if (!id) return
    try {
      const res = await apiService.rateResource(id, rating)
      if (res.success) {
        setResource(prev => prev ? { ...prev, rating: res.data.rating, ratingCount: res.data.ratingCount, userRating: rating } : prev)
        toast.success('评分成功')
      }
    } catch {
      toast.error('评分失败')
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { onNavigate('/auth?mode=login'); return }
    if (!id || !commentText.trim()) return
    setSubmittingComment(true)
    try {
      const res = await apiService.createComment(id, { content: commentText.trim() })
      if (res.success) {
        setComments(prev => [{ ...res.data, userName: user.name, userAvatar: user.avatar }, ...prev])
        setCommentText('')
        toast.success('评论发表成功')
      }
    } catch {
      toast.error('发表评论失败')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!id) return
    try {
      await apiService.deleteComment(id, commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
      toast.success('评论已删除')
    } catch {
      toast.error('删除失败')
    }
  }

  const handleDeleteResource = async () => {
    if (!id || !window.confirm('确定要删除这份资源吗？')) return
    try {
      await apiService.deleteResource(id)
      toast.success('资源已删除')
      onNavigate('/resources')
    } catch {
      toast.error('删除失败')
    }
  }

  const handleReport = async () => {
    if (!id || !reportReason) return
    setSubmittingReport(true)
    try {
      const res = await apiService.reportResource(id, { reason: reportReason, description: reportDesc })
      if (res.success) {
        toast.success('举报已提交，感谢您的反馈')
        setShowReportDialog(false)
        setReportReason('')
        setReportDesc('')
      }
    } catch {
      toast.error('举报失败')
    } finally {
      setSubmittingReport(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-6 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-foreground font-medium">资源不存在</p>
        <Button className="mt-4" onClick={() => onNavigate('/resources')}>返回资源库</Button>
      </div>
    )
  }

  const isOwner = user?.id === resource.uploaderId
  const isAdmin = user?.role === 'admin'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <button
        onClick={() => onNavigate('/resources')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />返回资源库
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resource Info Card */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                    {RESOURCE_TYPE_LABELS[resource.resourceType] || resource.resourceType}
                  </Badge>
                  {resource.college && (
                    <Badge variant="outline">{resource.college}</Badge>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">{resource.title}</h1>
              </div>
            </div>

            {resource.description && (
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">{resource.description}</p>
            )}

            {/* Meta info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {resource.course && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{resource.course}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{resource.uploaderName}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>{formatDate(resource.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span>{resource.fileName} ({formatSize(resource.fileSize)})</span>
              </div>
            </div>

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                {resource.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />评论 ({comments.length})
            </h2>

            {user ? (
              <form onSubmit={handleComment} className="mb-6">
                <Textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="分享你对这份资源的看法..."
                  className="mb-2 resize-none"
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={submittingComment || !commentText.trim()} className="gap-2">
                    <Send className="w-3.5 h-3.5" />发表评论
                  </Button>
                </div>
              </form>
            ) : (
              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-center">
                <p className="text-sm text-muted-foreground">
                  <button onClick={() => onNavigate('/auth?mode=login')} className="text-primary hover:underline">登录</button>
                  {' '}后可以发表评论
                </p>
              </div>
            )}

            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-6">暂无评论，成为第一个评论者吧</p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {comment.userName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">{comment.userName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                          {(user?.id === comment.userId || isAdmin) && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-foreground/80 mt-1 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <div className="bg-white rounded-xl border border-border p-5">
            <Button
              className="w-full mb-3 gap-2"
              size="lg"
              onClick={handleDownload}
              disabled={downloading}
            >
              <Download className="w-4 h-4" />
              {downloading ? '下载中...' : '下载资源'}
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className={`gap-2 ${resource.isLiked ? 'text-red-500 border-red-200 bg-red-50' : ''}`}
                onClick={handleLike}
              >
                <Heart className={`w-4 h-4 ${resource.isLiked ? 'fill-red-500' : ''}`} />
                {resource.likeCount}
              </Button>
              <Button
                variant="outline"
                className={`gap-2 ${resource.isFavorited ? 'text-yellow-500 border-yellow-200 bg-yellow-50' : ''}`}
                onClick={handleFavorite}
              >
                <Bookmark className={`w-4 h-4 ${resource.isFavorited ? 'fill-yellow-500' : ''}`} />
                {resource.favoriteCount}
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-foreground">{resource.downloadCount}</div>
                <div className="text-xs text-muted-foreground">下载次数</div>
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">
                  {resource.rating > 0 ? resource.rating.toFixed(1) : '-'}
                </div>
                <div className="text-xs text-muted-foreground">平均评分</div>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-medium text-foreground mb-3">评分</h3>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleRate(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoverRating || resource.userRating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {resource.ratingCount > 0
                ? `${resource.ratingCount} 人评分，平均 ${resource.rating.toFixed(1)} 分`
                : '暂无评分'}
            </p>
            {resource.userRating && (
              <p className="text-xs text-primary mt-1">你的评分: {resource.userRating} 分</p>
            )}
          </div>

          {/* Owner actions */}
          {(isOwner || isAdmin) && (
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-medium text-foreground mb-3">管理</h3>
              <div className="space-y-2">
                {isOwner && (
                  <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => onNavigate(`/upload?edit=${resource.id}`)}>
                    <Edit className="w-4 h-4" />编辑资源
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 text-destructive hover:text-destructive"
                  onClick={handleDeleteResource}
                >
                  <Trash2 className="w-4 h-4" />删除资源
                </Button>
              </div>
            </div>
          )}

          {/* Report */}
          {user && !isOwner && (
            <button
              onClick={() => setShowReportDialog(true)}
              className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors py-2"
            >
              <Flag className="w-4 h-4" />举报这份资源
            </button>
          )}
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>举报资源</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>举报原因</Label>
              <Select value={reportReason || 'none'} onValueChange={v => setReportReason(v === 'none' ? '' : v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="选择举报原因" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">请选择原因</SelectItem>
                  <SelectItem value="侵权内容">侵权内容</SelectItem>
                  <SelectItem value="内容不当">内容不当</SelectItem>
                  <SelectItem value="重复资源">重复资源</SelectItem>
                  <SelectItem value="信息错误">信息错误</SelectItem>
                  <SelectItem value="其他原因">其他原因</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>补充说明（可选）</Label>
              <Textarea
                value={reportDesc}
                onChange={e => setReportDesc(e.target.value)}
                placeholder="请详细描述问题..."
                className="mt-1 resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>取消</Button>
            <Button
              onClick={handleReport}
              disabled={!reportReason || reportReason === 'none' || submittingReport}
              className="bg-destructive hover:bg-destructive/90"
            >
              {submittingReport ? '提交中...' : '提交举报'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
