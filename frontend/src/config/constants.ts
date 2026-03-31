export const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export const COLLEGES = [
  '计算机学院',
  '理学院',
  '工学院',
  '经济管理学院',
  '人文学院',
  '外国语学院',
  '医学院',
  '法学院',
  '艺术学院',
  '教育学院',
]

export const RESOURCE_TYPES = [
  { value: 'courseware', label: '课件' },
  { value: 'notes', label: '笔记' },
  { value: 'exam', label: '历年试卷' },
  { value: 'assignment', label: '作业' },
  { value: 'other', label: '其他' },
] as const

export const RESOURCE_TYPE_LABELS: Record<string, string> = {
  courseware: '课件',
  notes: '笔记',
  exam: '历年试卷',
  assignment: '作业',
  other: '其他',
}

export const SORT_OPTIONS = [
  { value: 'newest', label: '最新上传' },
  { value: 'popular', label: '最多下载' },
  { value: 'rating', label: '评分最高' },
]
