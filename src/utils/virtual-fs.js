/* eslint-disable */

/**
 * Virtual FS for interacting with
 * "Files" in the browser by storing
 * them in buffers.
 *
 */

function xmlTpl(name) {
  const key = `templates/${name}.tpl.xml`;
  const file = {};
  file[
    key
  ] = require(`../../node_modules/@authenio/xml-encryption/lib/templates/${name}.tpl.xml`);
  return file;
}

function VirtualFileSystem() {
  this.fileSystem = {
    ...xmlTpl('encrypted-key'),
    ...xmlTpl('keyinfo'),
  };
  this.dataSystem = {};
}

VirtualFileSystem.prototype.readFileSync = function (filename, options) {
  filename = fixFilename(filename);

  const dataContent = this.dataSystem[filename];
  if (typeof dataContent === 'string' && options === 'utf8') {
    return dataContent;
  }

  if (dataContent) {
    return new Buffer(
      dataContent,
      typeof dataContent === 'string' ? 'base64' : undefined,
    );
  }

  const content = this.fileSystem[filename];
  if (content) {
    return content;
  }

  throw `File '${filename}' not found in virtual file system`;
};

VirtualFileSystem.prototype.writeFileSync = function (filename, content) {
  this.fileSystem[fixFilename(filename)] = content;
};

VirtualFileSystem.prototype.bindFS = function (data) {
  this.dataSystem = data || {};
};

function fixFilename(filename) {
  if (filename.indexOf(__dirname) === 0) {
    filename = filename.substring(__dirname.length);
  }

  if (filename.indexOf('/') === 0) {
    filename = filename.substring(1);
  }

  return filename;
}

module.exports = new VirtualFileSystem();
