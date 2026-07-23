const cloudinary = require('cloudinary').v2;

// A SDK do Cloudinary lê process.env.CLOUDINARY_URL automaticamente
// (formato: cloudinary://<api_key>:<api_secret>@<cloud_name>) — só garantimos
// que a validação de env (config/index.js) já rodou antes deste require.
require('./index');
cloudinary.config({ secure: true });

module.exports = cloudinary;
