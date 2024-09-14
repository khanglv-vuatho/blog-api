import { Request, Response, NextFunction } from 'express'
import sharp from 'sharp'

export const imageResizeMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const { width, height } = req.query
  const imageUrl = `${process.env.WORKER_API_URL}${req.path}`

  try {
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      return res.status(404).send('Image not found')
    }

    const arrayBuffer = await imageResponse.arrayBuffer()
    let imageBuffer = Buffer.from(arrayBuffer)

    if (width || height) {
      const resizeOptions: sharp.ResizeOptions = {
        fit: 'inside',
        withoutEnlargement: true,
        width: width ? parseInt(width as string) : undefined,
        height: height ? parseInt(height as string) : undefined
      }

      imageBuffer = await sharp(imageBuffer).resize(resizeOptions).toBuffer()
    }

    res.set('Content-Type', imageResponse.headers.get('content-type') || 'image/jpeg')
    res.send(imageBuffer)
  } catch (error) {
    console.error('Error processing image:', error)
    next(error)
  }
}
