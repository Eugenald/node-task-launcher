import * as process from 'node:process'

export default () => ({
  host: process.env.HOST || '0.0.0.0',
  port: parseInt(process.env.PORT ?? '3030'),
  job: {
    driver: process.env.JOB_DRIVER || 'memory',
    maxParallel: parseInt(process.env.MAX_PARALLEL || '4'),
    task: process.env.TASK || 'task_app.sh',
  },
})
