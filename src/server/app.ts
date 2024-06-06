import express from 'express'
import exitHook from 'async-exit-hook'
import cors from 'cors'
import cron from 'node-cron'

import { corsOptions } from '@/config/cors'
import { CLOSE_DB, CONNECT_DB } from '@/config/mongodb'
import { env } from '@/config/environment'
import { errorHandlingMiddleware } from '@/middlewares/errorHandlingMiddleware'
import { APIs_V1 } from '@/routes/v1'
import axios from 'axios'

const START_SERVER = async () => {
  const app = express()

  const port = process.env.APP_PORT || 5000

  app.use(cors(corsOptions))

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  app.use('/v1', APIs_V1)

  //middleware xử lí lỗi tập trung
  app.use(errorHandlingMiddleware)

  app.get('/', (req, res) => {
    res.end('<h1>Hello World!</h1>')
  })

  app.listen(port, () => {
    console.log(`Hello World, I am running at http://${env.APP_HOST}:${port}`)
  })

  cron.schedule('*/10 * * * *', async () => {
    try {
      // Gửi request lên API
      const response = await axios.get('https://auto.trisielts.online/v1/tags')

      // Xử lý dữ liệu trả về nếu cần
      console.log(response.data)
    } catch (error) {
      console.error('Error sending request:', error)
    }
  })

  exitHook(() => {
    console.log('Closing database connection')
    CLOSE_DB()
    console.log('Exiting')
  })
}

;(async () => {
  try {
    await CONNECT_DB()
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()
