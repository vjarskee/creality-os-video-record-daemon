import { spawn, type ChildProcessWithoutNullStreams } from 'child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import mustache from 'mustache'
import { resolve } from 'path'
import { parseArgs } from 'util'
import { logger } from './logger.js'
import type { Data } from './types/data.type.js'
import type { WsMessage } from './types/ws-message.type.js'
import { parseFilename } from './utils/parse-filename.util.js'
import { parsePosition } from './utils/parse-position.util.js'
import { parseSeconds } from './utils/parse-seconds.util.js'

const { values: args } = parseArgs({
  options: {
    host: {
      type: 'string'
    }
  }
})

if (!args.host || typeof args.host !== 'string') {
  logger.error('App', 'Invalid host')
  process.exit(1)
}

writeFileSync('./overlay', '', 'utf8')
if (!existsSync(resolve(process.cwd(), 'output'))) mkdirSync(resolve(process.cwd(), 'output'))

const data: Data = {
  TotalLayer: 0,
  bedTemp0: '0',
  curPosition: 'X:0 Y:0 Z:0',
  layer: 0,
  nozzleTemp: '0',
  printFileName: '',
  printJobTime: 0,
  printLeftTime: 0,
  printProgress: 0,
  printStartTime: 0,
  state: 0,
  targetBedTemp0: 0,
  targetNozzleTemp: 0
}

const refData: Data = JSON.parse(JSON.stringify(data))

let isConnected = false
let videoAvailable = false
let isRecording = false

let ffmpegProccess: ChildProcessWithoutNullStreams | null = null

function startRecord() {
  if (isRecording) return

  logger.log('App', 'Start record')
  isRecording = true

  ffmpegProccess = spawn('ffmpeg', [
    '-hide_banner',
    '-i',
    `http://${args.host}:8080/?action=stream`,
    '-vf',
    `drawtext=textfile=overlay:reload=1:fontcolor=white:fontsize=24:borderw=3:bordercolor=black:x=10:y=10`,
    `output/${new Date()
      .toLocaleString()
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase()}.mp4`
  ])

  ffmpegProccess.stderr.on('data', data => {
    logger.log('FFmpeg', data)
  })

  ffmpegProccess.stdout.on('data', data => {
    logger.log('FFmpeg', data)
  })

  ffmpegProccess.on('close', code => {
    logger.log('FFmpeg', `Closed with ${code} code`)
  })
}

function stopRecord() {
  if (!isRecording) return

  logger.log('App', 'Stop record')
  isRecording = false

  if (ffmpegProccess) ffmpegProccess.stdin.write('q')

  data.TotalLayer = refData.TotalLayer
  data.bedTemp0 = refData.bedTemp0
  data.curPosition = refData.curPosition
  data.layer = refData.layer
  data.nozzleTemp = refData.nozzleTemp
  data.printFileName = refData.printFileName
  data.printJobTime = refData.printJobTime
  data.printLeftTime = refData.printLeftTime
  data.printProgress = refData.printProgress
  data.printStartTime = refData.printStartTime
  data.targetBedTemp0 = refData.targetBedTemp0
  data.targetNozzleTemp = refData.targetNozzleTemp

  writeFileSync('./overlay', '', 'utf8')
}

async function bootstrap() {
  logger.log('App', 'Check MJPEG stream server...')
  try {
    await fetch(`http://${args.host}:8080`, { method: 'HEAD' })

    logger.log('App', 'MJPEG stream server available!')
    videoAvailable = true
  } catch {
    logger.error('App', 'MJPEG stream server unavailable...')
    videoAvailable = false
  }

  logger.log('App', 'Connecting to printer websocket...')

  const ws = new WebSocket(`ws://${args.host}:9999`)

  ws.onopen = () => logger.log('WS', 'Connected to printer websocket!')

  ws.onmessage = event => {
    if (!videoAvailable) return

    try {
      const msg: WsMessage = JSON.parse(event.data)

      if (msg.state !== undefined) {
        if (msg.state === 1) startRecord()
        else stopRecord()
      }

      if (msg.TotalLayer !== undefined) data.TotalLayer = msg.TotalLayer
      if (msg.bedTemp0 !== undefined) data.bedTemp0 = msg.bedTemp0
      if (msg.curPosition !== undefined) data.curPosition = msg.curPosition
      if (msg.layer !== undefined) data.layer = msg.layer
      if (msg.nozzleTemp !== undefined) data.nozzleTemp = msg.nozzleTemp
      if (msg.printFileName !== undefined) data.printFileName = msg.printFileName
      if (msg.printJobTime !== undefined) data.printJobTime = msg.printJobTime
      if (msg.printLeftTime !== undefined) data.printLeftTime = msg.printLeftTime
      if (msg.printProgress !== undefined) data.printProgress = msg.printProgress
      if (msg.printStartTime !== undefined) data.printStartTime = msg.printStartTime
      if (msg.targetBedTemp0 !== undefined) data.targetBedTemp0 = msg.targetBedTemp0
      if (msg.targetNozzleTemp !== undefined) data.targetNozzleTemp = msg.targetNozzleTemp

      const currentPosition = parsePosition(data.curPosition)

      if (isRecording) {
        writeFileSync(
          './overlay',
          mustache.render(readFileSync(resolve(process.cwd(), 'templates/txt_output.mustache'), 'utf8'), {
            layer: data.layer,
            total_layer: data.TotalLayer,
            current_position_x: currentPosition.x,
            current_position_y: currentPosition.y,
            current_position_z: currentPosition.z,
            nozzle_temp: Number(data.nozzleTemp).toFixed(2),
            target_nozzle_temp: data.targetNozzleTemp,
            bed_temp: Number(data.bedTemp0).toFixed(2),
            target_bed_temp: data.targetBedTemp0,
            print_file_name: parseFilename(data.printFileName),
            print_job_time: parseSeconds(data.printJobTime),
            print_left_time: parseSeconds(data.printLeftTime),
            print_start_date: new Date(data.printStartTime * 1000).toLocaleString(),
            print_end_date: new Date(
              (data.printStartTime + data.printJobTime + data.printLeftTime) * 1000
            ).toLocaleString(),
            print_progress: data.printProgress
          })
        )
      }
    } catch (err) {
      logger.error('App', `Invalid JSON: ${err}`)
    }
  }

  ws.onclose = () => {
    logger.log('WS', 'Connection closed')
    isConnected = false

    stopRecord()
    startPolling()
  }
}

async function startPolling() {
  logger.log('App', 'Wait printer...')

  while (!isConnected) {
    try {
      const res = await fetch(`http://${args.host}`, { method: 'HEAD' })
      if (res.ok) {
        logger.log('App', 'Printer is available online!')

        isConnected = true
        bootstrap()
      }
    } catch {}

    await new Promise(resolve => setTimeout(resolve, 2000))
  }
}

startPolling()

function exit(signal: string) {
  logger.log('App', `${signal} signal received`)
  stopRecord()
  logger.log('App', 'Exit...')
  process.exit(0)
}

process.on('SIGTERM', exit)
process.on('SIGINT', exit)
