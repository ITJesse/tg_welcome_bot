import axios from 'axios'
import { Telegraf } from 'telegraf'

import { getOrigImgUrl, getTweetById } from '../utils'

export default async function downloadTweetAll(
  bot: Telegraf,
  tweetId: string,
  chatId: number,
  replyMsgId: number,
) {
  const tweet = await getTweetById(tweetId)
  const images = tweet.includes.media?.map((e: any) => getOrigImgUrl(e.url))
  if (images) {
    const imageBufs: Buffer[] = await Promise.all(
      images.map((e: any) =>
        axios
          .get(e, { responseType: 'arraybuffer' })
          .then(({ data }) => Buffer.from(data)),
      ),
    )
    bot.telegram.sendMediaGroup(
      chatId,
      imageBufs.map((e, i) => ({
        type: 'document',
        media: { filename: `${tweetId}_${i + 1}.jpg`, source: e },
      })),
      {
        reply_to_message_id: replyMsgId,
        disable_notification: true,
      },
    )
  }
}
