import amqp from 'amqplib'
import { notification } from './utils/notifications.js'
import dotenv from 'dotenv'
dotenv.config()

const connected = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URI)

  const channel = await connection.createChannel()
  const queue = process.env.RABBITMQ_QUEUE

  channel.assertQueue(queue, { durable: true })

  channel.consume(queue, message => {
    const data = message.content.toString()
    const responseJson = JSON.parse(data)
    const payload = JSON.parse(responseJson.payload)

    console.log(responseJson)
    console.log(payload)
    // channel.ack(message)

    try {
      notification(responseJson.phoneNumber, 'Redmine', payload.message)
      console.log('Notifikasi telah berhasil masuk')
    } catch (error) {
      console.log(error.message)
    }
  }, { noAck: false })
}

connected()
