const mongoose = require('mongoose')

/**
 * @class UploadHelper
 * @description Upload files helper
 */
module.exports = class UploadHelper {
  constructor() {
    this.document_model = resolveOnce('app.models.DocumentModel')
  }

  /**
   * @method handleImage
   * @description Handle upload of image file
   * @param {string} template
   * @param {string} subject
   * @param {string} email_address
   */
  async handleImage(request, name, path, _ext, _rand) {
    if(_ext === undefined) _ext = ''
    if(_rand === undefined) _rand = ''
    if (!request.files || request.files[name] === undefined) return { error: false, filename: null }
    let file = request.files[name]
    let extension = /[^.]+$/.exec(file.name)
    let filename_without_extension = file.name.replace('.' + extension, '')
    filename_without_extension = filename_without_extension.replace(/[^a-zA-Z0-9-_\.]/g, '')
    let filename = name + (_rand != '' ? _rand : '') + '-' + filename_without_extension + '-' + mongoose.Types.ObjectId() + '.' + (_ext != '' ? _ext : extension)
    filename = filename.replace(/ /g, '-')
    let new_filename = root_directory + path + filename
    let move_response = await file.mv(new_filename)
    if (move_response) return { error: true, message: 'Unable to upload file' }

    // ^ @TODO add error logging
    return { error: false, filename: filename }
  }

  /**
   * @method handleImage
   * @description Handle upload of image file
   */
  async handleImageMultiple(request, name) {
    try {
      let path = '/public/upload_images/'

      if (!request.files[name].length)
        request.files[name] = [request.files[name]]
      var images_name_array = []
      for (let i = 0; i < request.files[name].length; i++) {
        let file = request.files[name][i]
        let extension = /[^.]+$/.exec(file.name)
        let filename_without_extension = file.name.replace('.' + extension, '')
        let filename =
          name +
          '-' +
          filename_without_extension +
          '-' +
          mongoose.Types.ObjectId() +
          '.' +
          extension
        filename = filename.replace(/ /g, '-')
        let new_filename = root_directory + path + filename
        let move_response = await file.mv(new_filename)
        images_name_array.push({ name: filename })
      }

      let filenames = images_name_array
      let upload_document = await this.document_model.create(filenames)
      let upload_document_id = []
      upload_document.map(_id => upload_document_id.push(_id._id))
      return { error: false, upload_document: upload_document_id }
    } catch (err) {
      // logger.log({
      //   level: 'error',
      //   message: err
      // })
      return { error: true }
    }
  }

  /**
   * @method handleDelete
   * @description delete a file
   * @param {string} filename
   */
  async handleDelete(filename) {
    let file_path = root_directory + '/public/images/' + filename
    if (fs.existsSync(file_path)) {
      fs.unlinkSync(file_path)
    }
  }
}
