const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const moveFile = require('move-file');
const filenamify = require('filenamify');
const { v4: uuid } = require('uuid');
const sharp = require('sharp');

module.exports = {
  inputs: {
    file: {
      type: 'json',
      required: true,
    },
    copyFile: {
      type: 'boolean',
      defaultsTo: false,
    },
  },

  async fn(inputs) {
    const dirname = uuid();

    // FIXME: https://github.com/sindresorhus/filenamify/issues/13
    const filename = filenamify(inputs.file.filename);

    const rootPath = path.join(sails.config.custom.attachmentsPath, dirname);
    const filePath = path.join(rootPath, filename);

    fs.mkdirSync(rootPath);
    if (inputs.copyFile) {
      fs.copyFileSync(inputs.file.fd, filePath);
    } else {
      await moveFile(inputs.file.fd, filePath);
    }

    const image = sharp(filePath, {
      animated: true,
    });

    let metadata;
    try {
      metadata = await image.metadata();
    } catch {} // eslint-disable-line no-empty
    const fileData = {
      dirname,
      filename,
      image: null,
      name: inputs.file.filename,
    };

    if (metadata && !['svg', 'pdf'].includes(metadata.format)) {
      const thumbnailsPath = path.join(rootPath, 'thumbnails');
      fs.mkdirSync(thumbnailsPath);

      const { width, pageHeight: height = metadata.height } = metadata;
      const isPortrait = height > width;
      const thumbnailsExtension = metadata.format === 'jpeg' ? 'jpg' : metadata.format;

      try {
        await image
          .resize(
            256,
            isPortrait ? 320 : undefined,
            width < 256 || (isPortrait && height < 320)
              ? {
                  kernel: sharp.kernel.nearest,
                }
              : undefined,
          )
          .toFile(path.join(thumbnailsPath, `cover-256.${thumbnailsExtension}`));

        fileData.image = {
          width,
          height,
          thumbnailsExtension,
        };
      } catch {
        try {
          rimraf.sync(thumbnailsPath);
        } catch (error2) {
          console.warn(error2.stack); // eslint-disable-line no-console
        }
      }
    }

    return fileData;
  },
};
