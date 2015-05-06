angular.module("common.util").factory('common.util.file', [
    '$q',
    'common.util.device',
    'common.util.logger',
    function ($q, device, logger) {

        var file = {

            upload : function (file_url, server_url, options) {

                return $q(function (resolve, reject) {

                    if (!device.isCordova()) {
                        reject();
                        return false;
                    }
                    var file_options = new FileUploadOptions();

                    var fileName = file_url.substr(file_url.lastIndexOf('/') + 1);
                    file_options.fileKey = options.fileKey ? options.fileKey : 'file';
                    file_options.fileName = fileName ? fileName : 'image.jpg';
                    file_options.mimeType = options.mimeType ? options.mimeType : 'image/jpeg';
                    file_options.params = options.params ? options.params : {};
                    file_options.chunkedMode = options.chunkedMode ? options.chunkedMode : true;
                    file_options.headers = options.headers ? options.headers : {};

                    var ft = new FileTransfer();

                    ft.upload(file_url, server_url, function (req) {
                        resolve(req);
                    }, function (error) {
                        reject(error);
                    }, file_options);

                }).then(function (r) {
                    try {
                        navigator.camera.cleanup();
                    } catch (e) {
                        logger.error(e.message, e.stack);
                    }
                    var response = r.response ? JSON.parse(r.response) : '';
                    logger.log("Code = " + r.responseCode);
                    logger.log("Response = " + r.response);
                    logger.log("Sent = " + r.bytesSent);
                    return response;
                });
            }
        };

        return file;

    }
]);