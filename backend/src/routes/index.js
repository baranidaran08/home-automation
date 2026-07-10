'use strict';

const { Router } = require('express');
const v1Routes = require('./v1');

/**
 * Top-level router. Delegates to versioned sub-routers. Adding /api/v2 later
 * is a one-line change here and requires no refactor of existing modules.
 */
const router = Router();

router.use('/v1', v1Routes);

module.exports = router;
