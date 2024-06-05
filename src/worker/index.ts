import axios from 'axios'

export const uploadFile = async (url: string, buffer: any) => {
  await axios.put(url, buffer, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const deleteFile = async (url: string) => {
  await axios.delete(url)
}

export const updateFile = async (url: string, buffer: any) => {
  await axios.put(url, buffer, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
