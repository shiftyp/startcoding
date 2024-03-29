export const fetchImage = async (url: string) => {
  const image = new Image()
  image.src = url

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
     image.onerror = () => reject()
  })
  
  return await createImageBitmap(image)
}