const crypto = require('crypto')

const algorithm = 'aes-256-ctr'
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3'
const iv = crypto.randomBytes(16)

module.exports = class CryptHelper {
  encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv)

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()])

    return {
      iv: iv.toString('hex'),
      content: encrypted.toString('hex'),
    }
  }

  decrypt(hash) {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'))

    const decrpyted = Buffer.concat([
      decipher.update(Buffer.from(hash.content, 'hex')),
      decipher.final(),
    ])

    return decrpyted.toString()
  }

  generateToken(text) {
    return this.encrypt(text).content
  }
}
