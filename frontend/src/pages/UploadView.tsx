import { useState, useEffect, useCallback } from 'react'
import { NavigateFunction, useSearchParams } from 'react-router-dom'
import { Upload, File, X, CheckCircle, AlertCircle, Plus, Trash2, Edit, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { toast } from 'sonner'
import { apiService } from '@/lib/api'
import type { User, Resource } from '@shared/types/api'
import { COLLEGES, RESOURCE_TYPES } from '@/config/constants'

interface UploadViewProps {
  user: User | null
  onNavigate: NavigateFunction
}

export default function UploadView({ user, onNavigate }: UploadViewProps) {
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const [editResource, setEditResource] = useState<Resource | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<{ fileUrl: string; fileName: string; fileSize: number; fileType: string } | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [resourceType, setResourceType] = useState('')
  const [course, setCourse] = useState('')
  const [college, setCollege] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const loadEditResource = useCallback(async () => {
    if (!editId) return
    setIsEditing(true)
    try {
      const res = await apiService.getResource(editId)
      if (res.success) {
        const r = res.data
        setEditResource(r)
        setTitle(r.title)
        setDescription(r.description || '')
        setResourceType(r.resourceType)
        setCourse(r.course || '')
        setCollege(r.college || '')
        setTags(r.tags || [])
        setUploadedFile({ fileUrl: r.fileUrl, fileName: r.fileName, fileSize: r.fileSize, fileType: r.fileType })
      }
    } catch {
      toast.error('加载资源失败')
    }
  }, [editId])

  useEffect(() => { loadEditResource() }, [loadEditResource])

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-xl font-bold text-foreground mb-2">登录后才能上传资源</h2>
        <p className="text-muted-foreground mb-4">请先登录或注册账号</p>
        <Button onClick={() => onNavigate('/auth?mode=login')}>去登录</Button>
      </div>
    )
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (selected.size > 50 * 1024 * 1024) {
        toast.error('文件大小不能超过50MB')
        return
      }
      setFile(selected)
      if (!title) setTitle(selected.name.replace(/\.[^/.]+$/, ''))
    }
  }

  const handleUploadFile = async () => {
    if (!file) return
    setUploading(true)
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90))
    }, 200)
    try {
      const res = await apiService.uploadFile(file)
      clearInterval(interval)
      setUploadProgress(100)
      if (res.success) {
        setUploadedFile(res.data)
        toast.success('文件上传成功')
      } else {
        toast.error('文件上传失败')
      }
    } catch {
      clearInterval(interval)
      toast.error('文件上传失败')
    } finally {
      setUploading(false)
    }
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags(prev => [...prev, t])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { toast.error('请输入资源标题'); return }
    if (!resourceType) { toast.error('请选择资源类型'); return }
    if (!uploadedFile && !isEditing) { toast.error('请上传文件'); return }

    setSubmitting(true)
    try {
      if (isEditing && editId) {
        const res = await apiService.updateResource(editId, {
          title: title.trim(),
          description: description.trim() || undefined,
          resourceType: resourceType as Resource['resourceType'],
          course: course.trim() || undefined,
          college: college || undefined,
          tags,
        })
        if (res.success) {
          toast.success('资源更新成功')
          onNavigate(`/resources/${editId}`)
        }
      } else if (uploadedFile) {
        const res = await apiService.createResource({
          title: title.trim(),
          description: description.trim() || undefined,
          fileUrl: uploadedFile.fileUrl,
          fileName: uploadedFile.fileName,
          fileSize: uploadedFile.fileSize,
          fileType: uploadedFile.fileType,
          resourceType: resourceType as Resource['resourceType'],
          course: course.trim() || undefined,
          college: college || undefined,
          tags,
        })
        if (res.success) {
          toast.success('资源上传成功！')
          onNavigate(`/resources/${res.data.id}`)
        }
      }
    } catch {
      toast.error('操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {isEditing ? '编辑资源' : '上传资源'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isEditing ? '修改资源信息' : '分享优质学习资源，帮助更多同学'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        {!isEditing && (
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-4">选择文件</h2>
            {!uploadedFile ? (
              <div>
                <label
                  htmlFor="file-input"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium text-foreground">点击选择文件</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, DOC, PPT, XLS, TXT, ZIP 等，最大 50MB</p>
                  <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.png,.jpg,.jpeg"
                  />
                </label>
                {file && (
                  <div className="mt-3 flex items-center justify-between bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <File className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        ({(file.size / (1024 * 1024)).toFixed(1)}MB)
                      </span>
                    </div>
                    <Button type="button" size="sm" onClick={handleUploadFile} disabled={uploading}>
                      {uploading ? '上传中...' : '上传'}
                    </Button>
                  </div>
                )}
                {uploading && (
                  <div className="mt-2">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">上传中... {uploadProgress}%</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-green-800 truncate">{uploadedFile.fileName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setUploadedFile(null); setFile(null) }}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Resource Info */}
        <div className="bg-white rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-foreground">资源信息</h2>

          <div>
            <Label htmlFor="title">资源标题 *</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="请输入资源标题"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">资源描述</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="简要描述资源内容和适用范围..."
              className="mt-1 resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>资源类型 *</Label>
              <Select value={resourceType || 'none'} onValueChange={v => setResourceType(v === 'none' ? '' : v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">请选择类型</SelectItem>
                  {RESOURCE_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>所属学院</Label>
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
          </div>

          <div>
            <Label htmlFor="course">课程名称</Label>
            <Input
              id="course"
              value={course}
              onChange={e => setCourse(e.target.value)}
              placeholder="例如：数据结构与算法"
              className="mt-1"
            />
          </div>

          <div>
            <Label>标签（最多5个）</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                placeholder="输入标签后按回车添加"
                disabled={tags.length >= 5}
              />
              <Button type="button" variant="outline" onClick={addTag} disabled={tags.length >= 5}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            className="flex-1 gap-2"
            disabled={submitting || (!isEditing && !uploadedFile)}
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
            {submitting ? '提交中...' : isEditing ? '保存修改' : '上传资源'}
          </Button>
          <Button type="button" variant="outline" onClick={() => onNavigate('/resources')}>
            取消
          </Button>
        </div>
      </form>
    </div>
  )
}
