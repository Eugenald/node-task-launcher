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

  constructor(config: ConfigService) {
    this.scriptPath = resolve('task', config.get<string>('job.task'))
  }

  run(args: string[] = []): Promise<BatchJobResult> {
    return new Promise((resolve, reject) => {
      const ext = extname(this.scriptPath).toLowerCase()
      let command: string
      let cmdArgs: string[] = args
      let useShell = false

      /* === COMMAND === */
      if (this.isWindows) {
        // ---------- WINDOWS ----------
        if (ext === '.sh') {
          return reject(new Error('Cannot execute .sh task on Windows environment'))
        }
        if (ext === '.bat') {
          command = this.scriptPath
          useShell = true // .bat
        } else {
          // .exe
          command = this.scriptPath
        }
      } else {
        // ---------- UNIX / macOS ----------
        if (ext === '.sh') {
          command = this.scriptPath
          useShell = true
        } else if (ext === '.exe') {
          command = 'wine'
          cmdArgs = [this.scriptPath, ...args]
        } else if (ext === '.bat') {
          command = 'wine'
          cmdArgs = ['cmd', '/c', this.scriptPath, ...args]
        } else {
          return reject(new Error(`Unsupported task extension '${ext}' on Unix`))
        }
      }

      /* === SPAWN === */
      const child = spawn(command, cmdArgs, {
        shell: useShell,
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      })

      let stdout = ''
      let stderr = ''

      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString()
        this.log.debug(`[STDOUT] ${chunk.toString().trim()}`)
      })

      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString()
        this.log.debug(`[STDERR] ${chunk.toString().trim()}`)
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
