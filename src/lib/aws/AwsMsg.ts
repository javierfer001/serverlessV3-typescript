import {
    PinpointClient,
    SendMessagesCommand,
    SendMessagesCommandInput,
} from '@aws-sdk/client-pinpoint'
import { logger } from 'src/lib/logger'
import { AWS_REGION, IS_OFFLINE, LOCALSTACK_URL } from 'src/LambdaConfig'

const sesConfig = {
    region: AWS_REGION,
}

if (IS_OFFLINE) {
    Object.assign(sesConfig, { endpoint: LOCALSTACK_URL })
}

const smsClient = new PinpointClient({
    region: 'us-west-2',
})

export class AwsMsg {
    async sendSms(phone: string, msg: string) {
        try {
            // Define the message content and destination number.
            const message: SendMessagesCommandInput = {
                ApplicationId: '498bfa419b164b9fafc0afb38f7018e7',
                MessageRequest: {
                    Addresses: {
                        [phone]: {
                            ChannelType: 'SMS',
                        },
                    },
                    MessageConfiguration: {
                        SMSMessage: {
                            Body: msg,
                            MessageType: 'TRANSACTIONAL', // Use "TRANSACTIONAL" for transactional messages
                        },
                    },
                },
            }

            const smsCommand = new SendMessagesCommand(message)
            let response = await smsClient.send(smsCommand)
            logger.log('smsCommand - ', response)
            return response
        } catch (error) {
            logger.error('The sendSms failed', { error })
            return error
        }
    }
}
export const awsMsg = new AwsMsg()
