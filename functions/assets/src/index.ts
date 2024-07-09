import * as functionsV2 from "firebase-functions/v2";
import request from 'request'

export const assets = functionsV2.https.onRequest(
  (req, res) => {
    const imageURL = req.path.replace(/^\/assets\//, 'https://firebasestorage.googleapis.com/v0/b/woofjs2-assets/o/') + '?alt=media'

    req.pipe(request(imageURL)).pipe(res)
  });