angular.module('bhima.services')
  .service('DownloadLinkService', DownloadLinkService);

// dependencies injection
DownloadLinkService.$inject = [];

// service definition
function DownloadLinkService() {
  const service = this;

  const typeMime = {
    aac : 'audio/aac',
    abw : 'application/x-abiword',
    arc : 'application/octet-stream',
    avi : 'video/x-msvideo',
    azw : 'application/vnd.amazon.ebook',
    bin : 'application/octet-stream',
    bmp : 'image/bmp',
    bz  : 'application/x-bzip',
    bz2 : 'application/x-bzip2',
    csh : 'application/x-csh',
    css : 'text/css',
    csv : 'text/csv',
    doc : 'application/msword',
    docx : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    eot : 'application/vnd.ms-fontobject',
    epub : 'application/epub+zip',
    gif : 'image/gif',
    html : 'text/html',
    ico : 'image/x-icon',
    ics : 'text/calendar',
    jar : 'application/java-archive',
    jpeg : 'image/jpeg',
    jpg : 'image/jpeg',
    js  : 'application/javascript',
    json : 'application/json',
    midi : 'audio/midi',
    mpeg : 'video/mpeg',
    mpkg : 'application/vnd.apple.installer+xml',
    odp : 'application/vnd.oasis.opendocument.presentation',
    ods : 'application/vnd.oasis.opendocument.spreadsheet',
    odt : 'application/vnd.oasis.opendocument.text',
    oga : 'audio/ogg',
    ogv : 'video/ogg',
    ogx : 'application/ogg',
    otf : 'font/otf',
    png : 'image/png',
    pdf : 'application/pdf',
    ppt : 'application/vnd.ms-powerpoint',
    pptx : 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    rar : 'application/x-rar-compressed',
    rtf : 'application/rtf',
    sh  : 'application/x-sh',
    svg : 'image/svg+xml',
    swf : 'application/x-shockwave-flash',
    tar : 'application/x-tar',
    tiff : 'image/tiff',
    tif : 'image/tiff',
    ts  : 'application/typescript',
    ttf : 'font/ttf',
    vsd : 'application/vnd.visio',
    wav : 'audio/x-wav',
    weba : 'audio/webm',
    webm : 'video/webm',
    webp : 'image/webp',
    woff : 'font/woff',
    woff2 : 'font/woff2',
    xhtml : 'application/xhtml+xml',
    xls : 'application/vnd.ms-excel',
    xlsx : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xml : 'application/xml',
    xul : 'application/vnd.mozilla.xul+xml',
    zip : 'application/zip',
    '3gp' : 'video/3gpp',
    '7z'  : 'application/x-7z-compressed',
  };

  /**
   * Download on the client file served by the server
   * @param {stream} data binary stream of the file
   * @param {string} type the mime type extension of the file
   * @param {string} filename the name of the file withour the extension
   */
  service.download = (data, type, filename = 'fichier') => {
    const name = (filename || 'fichier').concat('.', type);
    const file = new Blob([data], { type : typeMime[type] || 'application/octet-stream' });

    const url = window.URL || window.webkitURL;

    const downloadLink = angular.element('<a></a>');
    downloadLink.attr('href', url.createObjectURL(file));
    downloadLink.attr('target', '_self');
    downloadLink.attr('download', name);
    downloadLink[0].click();
  };

  return service;
}
