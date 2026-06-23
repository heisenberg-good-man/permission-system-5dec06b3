const express = require('express')
const router = express.Router()
const { messages, nextMsgId } = require('../data/store')

router.get('/:applicationId', (req, res) => {
  const result = messages
    .filter(m => m.applicationId === req.params.applicationId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  res.json(result)
})

router.post('/', (req, res) => {
  const { applicationId, senderRole, senderName, content } = req.body
  if (!applicationId || !senderRole || !content) {
    return res.status(400).json({ error: 'applicationId、senderRole、content为必填项' })
  }
  const validRoles = ['recruiter', 'applicant']
  if (!validRoles.includes(senderRole)) {
    return res.status(400).json({ error: `senderRole允许值: ${validRoles.join(', ')}` })
  }
  const msg = {
    id: nextMsgId,
    applicationId,
    senderRole,
    senderName: senderName || (senderRole === 'recruiter' ? '招聘方' : '应聘方'),
    content,
    createdAt: new Date().toISOString()
  }
  messages.push(msg)
  res.status(201).json(msg)
})

module.exports = router
