'use strict';

const { HTTP_STATUS } = require('../constants/httpStatus');

/**
 * Standardised success response envelope so every endpoint returns the same
 * shape: { success, message, data, meta }. `meta` is where pagination or
 * other cursor info goes for list endpoints.
 */
class ApiResponse {
  static send(res, { statusCode = HTTP_STATUS.OK, message = 'Success', data = null, meta } = {}) {
    const body = { success: true, message, data };
    if (meta !== undefined) {
      body.meta = meta;
    }
    return res.status(statusCode).json(body);
  }

  static ok(res, data, message = 'Success', meta) {
    return ApiResponse.send(res, { statusCode: HTTP_STATUS.OK, message, data, meta });
  }

  static created(res, data, message = 'Created') {
    return ApiResponse.send(res, { statusCode: HTTP_STATUS.CREATED, message, data });
  }

  static noContent(res) {
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  }
}

module.exports = ApiResponse;
