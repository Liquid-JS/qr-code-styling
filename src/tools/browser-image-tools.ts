export const browserImageTools = {
    toDataURL: (url: string | Buffer | Blob): Promise<string> => {
        if (typeof url == 'string' && url.startsWith('data:')) return Promise.resolve(url)
        return new Promise((resolve, reject) => {
            if (typeof url == 'string') {
                const xhr = new XMLHttpRequest()
                xhr.onload = () => {
                    const reader = new FileReader()
                    reader.onloadend = () => {
                        resolve(reader.result as string)
                    }
                    reader.readAsDataURL(xhr.response)
                }
                xhr.onerror = xhr.onabort = xhr.ontimeout = reject
                xhr.open('GET', url, true)
                xhr.responseType = 'blob'
                xhr.send()
            } else {
                const reader = new FileReader()
                reader.onloadend = () => {
                    resolve(reader.result as string)
                }
                reader.readAsDataURL(url as Blob)
            }
        })
    },
    getSize: (src: string | Blob | Buffer, crossOrigin?: string): Promise<{ width: number, height: number }> => new Promise((resolve, reject) => {
        const image = new Image()

        if (crossOrigin === 'string') {
            image.crossOrigin = crossOrigin
        }

        image.onload = (): void => {
            resolve({ width: image.width, height: image.height })
        }
        image.onerror = image.onabort = reject

        if (typeof src == 'string') image.src = src
        else
            browserImageTools
                .toDataURL(src)
                .then((url) => (image.src = url))
                .catch(reject)
    })
}
