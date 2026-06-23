const jobs = [
  {
    id: 'job_1',
    title: '高级前端工程师',
    company: '星辰科技有限公司',
    department: '技术部',
    location: '北京',
    salaryMin: 20000,
    salaryMax: 35000,
    headcount: 3,
    requirements: '1. 3年以上Vue/React开发经验\n2. 熟悉TypeScript、Webpack/Vite\n3. 有中大型项目架构设计经验\n4. 良好的沟通协作能力',
    status: 'open',
    createdAt: '2026-06-23T08:00:00.000Z',
    updatedAt: '2026-06-23T08:00:00.000Z'
  },
  {
    id: 'job_2',
    title: '后端开发工程师',
    company: '星辰科技有限公司',
    department: '技术部',
    location: '上海',
    salaryMin: 22000,
    salaryMax: 38000,
    headcount: 2,
    requirements: '1. 3年以上Java/Go/Node.js开发经验\n2. 熟悉MySQL、Redis等\n3. 有微服务架构实践经验\n4. 了解Docker/K8s',
    status: 'open',
    createdAt: '2026-06-22T09:00:00.000Z',
    updatedAt: '2026-06-22T09:00:00.000Z'
  },
  {
    id: 'job_3',
    title: 'UI设计师',
    company: '云海互动科技',
    department: '设计部',
    location: '深圳',
    salaryMin: 15000,
    salaryMax: 25000,
    headcount: 1,
    requirements: '1. 2年以上互联网产品UI设计经验\n2. 精通Figma/Sketch\n3. 有设计系统搭建经验\n4. 良好的审美和交互理解',
    status: 'open',
    createdAt: '2026-06-21T10:00:00.000Z',
    updatedAt: '2026-06-21T10:00:00.000Z'
  },
  {
    id: 'job_4',
    title: '产品经理',
    company: '云海互动科技',
    department: '产品部',
    location: '广州',
    salaryMin: 18000,
    salaryMax: 30000,
    headcount: 2,
    requirements: '1. 3年以上互联网产品经验\n2. 有B端产品0-1经验\n3. 数据驱动思维\n4. 优秀的沟通协调能力',
    status: 'open',
    createdAt: '2026-06-20T11:00:00.000Z',
    updatedAt: '2026-06-20T11:00:00.000Z'
  },
  {
    id: 'job_5',
    title: '测试工程师',
    company: '星辰科技有限公司',
    department: '质量部',
    location: '北京',
    salaryMin: 12000,
    salaryMax: 20000,
    headcount: 2,
    requirements: '1. 2年以上软件测试经验\n2. 熟悉自动化测试工具\n3. 了解持续集成流程\n4. 有性能测试经验优先',
    status: 'closed',
    createdAt: '2026-06-15T08:00:00.000Z',
    updatedAt: '2026-06-22T16:00:00.000Z'
  }
]

const applications = [
  {
    id: 'app_1',
    jobId: 'job_1',
    applicantName: '王明',
    contact: '13800001111',
    targetPosition: '高级前端工程师',
    resumeSummary: '5年前端开发经验，主导过多个大型ToB项目的前端架构设计与落地，熟悉Vue3生态和工程化方案。',
    skillTags: ['Vue', 'React', 'TypeScript', 'Vite'],
    workYears: 5,
    status: 'contacted',
    createdAt: '2026-06-23T09:30:00.000Z',
    updatedAt: '2026-06-23T14:00:00.000Z'
  },
  {
    id: 'app_2',
    jobId: 'job_1',
    applicantName: '李婷',
    contact: '13900002222',
    targetPosition: '高级前端工程师',
    resumeSummary: '3年前端开发经验，参与过电商平台和SaaS产品开发，擅长组件库建设和性能优化。',
    skillTags: ['Vue', 'Element Plus', 'Webpack'],
    workYears: 3,
    status: 'pending',
    createdAt: '2026-06-23T10:15:00.000Z',
    updatedAt: '2026-06-23T10:15:00.000Z'
  },
  {
    id: 'app_3',
    jobId: 'job_2',
    applicantName: '张伟',
    contact: '13700003333',
    targetPosition: '后端开发工程师',
    resumeSummary: '4年Go开发经验，有分布式系统和高并发服务设计经验，熟悉微服务架构。',
    skillTags: ['Go', 'gRPC', 'MySQL', 'Redis', 'Docker'],
    workYears: 4,
    status: 'interviewing',
    createdAt: '2026-06-22T11:00:00.000Z',
    updatedAt: '2026-06-23T09:00:00.000Z'
  },
  {
    id: 'app_4',
    jobId: 'job_4',
    applicantName: '赵敏',
    contact: '13600004444',
    targetPosition: '产品经理',
    resumeSummary: '3年B端产品经验，主导过企业协作工具0-1，擅长需求分析和数据驱动迭代。',
    skillTags: ['B端产品', '数据分析', 'Axure', 'Figma'],
    workYears: 3,
    status: 'rejected',
    createdAt: '2026-06-21T14:00:00.000Z',
    updatedAt: '2026-06-22T10:00:00.000Z'
  },
  {
    id: 'app_5',
    jobId: 'job_3',
    applicantName: '陈静',
    contact: '13500005555',
    targetPosition: 'UI设计师',
    resumeSummary: '2年互联网UI设计经验，参与过多个移动端和Web端产品设计，有设计系统搭建经验。',
    skillTags: ['Figma', 'Sketch', '设计系统', '交互设计'],
    workYears: 2,
    status: 'pending',
    createdAt: '2026-06-23T08:45:00.000Z',
    updatedAt: '2026-06-23T08:45:00.000Z'
  }
]

const messages = [
  {
    id: 'msg_1',
    applicationId: 'app_1',
    senderRole: 'recruiter',
    senderName: 'HR李经理',
    content: '您好王明，感谢您投递星辰科技的前端工程师岗位，我们对您的简历很感兴趣，方便约个时间电话沟通吗？',
    createdAt: '2026-06-23T14:00:00.000Z'
  },
  {
    id: 'msg_2',
    applicationId: 'app_1',
    senderRole: 'applicant',
    senderName: '王明',
    content: '李经理您好！非常感谢，我本周三或周四下午都可以，请问您方便吗？',
    createdAt: '2026-06-23T14:30:00.000Z'
  },
  {
    id: 'msg_3',
    applicationId: 'app_3',
    senderRole: 'recruiter',
    senderName: '技术总监陈工',
    content: '张伟你好，初步筛选通过，我们安排了周四下午3点的技术面试，届时请准备一下Go并发相关的内容。',
    createdAt: '2026-06-23T09:00:00.000Z'
  }
]

let jobIdCounter = jobs.length
let appIdCounter = applications.length
let msgIdCounter = messages.length

function generateId(prefix, counter) {
  return `${prefix}_${counter + 1}`
}

module.exports = {
  jobs,
  applications,
  messages,
  get nextJobId() { jobIdCounter++; return `job_${jobIdCounter}` },
  get nextAppId() { appIdCounter++; return `app_${appIdCounter}` },
  get nextMsgId() { msgIdCounter++; return `msg_${msgIdCounter}` }
}
