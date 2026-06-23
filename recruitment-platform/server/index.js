const express = require('express')
const cors = require('cors')
const jobsRouter = require('./routes/jobs')
const applicationsRouter = require('./routes/applications')
const messagesRouter = require('./routes/messages')
const statsRouter = require('./routes/stats')

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

app.use('/api/jobs', jobsRouter)
app.use('/api/applications', applicationsRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/stats', statsRouter)

app.listen(PORT, () => {
  console.log(`Recruitment mock API server running at http://localhost:${PORT}`)
  console.log(`API endpoints:`)
  console.log(`  GET    /api/jobs          - 职位列表（?keyword=&location=&status=）`)
  console.log(`  GET    /api/jobs/:id      - 职位详情`)
  console.log(`  POST   /api/jobs          - 创建职位`)
  console.log(`  PUT    /api/jobs/:id      - 更新职位`)
  console.log(`  DELETE /api/jobs/:id      - 删除职位`)
  console.log(`  GET    /api/applications  - 投递列表（?jobId=&status=&keyword=）`)
  console.log(`  GET    /api/applications/:id - 投递详情`)
  console.log(`  POST   /api/applications  - 投递简历`)
  console.log(`  PATCH  /api/applications/:id/status - 更新候选人状态`)
  console.log(`  GET    /api/messages/:applicationId - 消息列表`)
  console.log(`  POST   /api/messages      - 发送消息`)
  console.log(`  GET    /api/stats         - 统计数据`)
})
