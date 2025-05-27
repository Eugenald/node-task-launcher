import { Injectable, Logger } from '@nestjs/common'
import { spawn } from 'child_process'
import { platform } from 'os'
import { resolve, extname } from 'path'
import { ConfigService } from '@nestjs/config'

export interface BatchJobResult {
  stdout: string
  stderr: string
  exitCode: number | null
  signal: string | null
}

@Injectable()
export class JobRunnerService {
  private readonly log = new Logger(JobRunnerService.name)
  private readonly isWindows = platform() === 'win32'
  private readonly scriptPath: string

  constructor(cfg: ConfigService) {
    const taskName = cfg.get<string>('job.task')
    if (!taskName) throw new Error('`job.task` is not defined in configuration')

    this.scriptPath = resolve('task', cfg.get<string>('job.task'))
  }

  run(args: string[] = []): Promise<BatchJobResult> {
    return new Promise((resolve, reject) => {
      const ext = extname(this.scriptPath).toLowerCase()

      let command: string
      let cmdArgs: string[] = args
      let useShell = false

      if (ext === '.js') {
        command = process.execPath
        cmdArgs = [this.scriptPath, ...args]
      } else if (this.isWindows) {
        switch (ext) {
          case '.bat':
            command = this.scriptPath
            useShell = true // run via cmd.exe implicitly
            break
          case '.exe':
            command = this.scriptPath
            break
          case '.sh':
            return reject(new Error('Cannot execute .sh task in Windows environment'))
          default:
            return reject(new Error(`Unsupported task extension '${ext}' on Windows`))
        }
      } else {
        switch (ext) {
          case '.sh':
            command = this.scriptPath
            useShell = true
            break
          case '.exe':
            command = 'wine'
            cmdArgs = [this.scriptPath, ...args]
            break
          case '.bat':
            command = 'wine'
            cmdArgs = ['cmd', '/c', this.scriptPath, ...args]
            break
          default:
            return reject(new Error(`Unsupported task extension '${ext}' on Unix`))
        }
      }

      const child = spawn(command, cmdArgs, {
        shell: useShell,
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      })

      let stdout = ''
      let stderr = ''

      child.stdout.on('data', (chunk) => {
        const data = chunk.toString()
        stdout += data
        this.log.debug(`[STDOUT] ${data.trim()}`)
      })

      child.stderr.on('data', (chunk) => {
        const data = chunk.toString()
        stderr += data
        this.log.debug(`[STDERR] ${data.trim()}`)
      })

      child.once('error', (err) => {
        this.log.error(`Spawn failed: ${err.message}`)
        reject(err)
      })

      child.once('exit', (code, signal) => {
        this.log.log(`Task finished (code=${code}, signal=${signal ?? 'none'})`)
        resolve({ stdout, stderr, exitCode: code, signal })
      })
    })
  }
}
