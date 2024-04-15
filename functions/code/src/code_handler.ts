import stream from 'stream'

import { Project } from "./repos.js";

export const handler = async (headers: Headers, stream: stream.Duplex) => {
  const id = headers.get('location')!.split("/")[2];
  console.log(id);

  if (id) {
    try {
      const project = await Project.init(id)
      await project.proxy(headers, stream);
    } catch (e) {
      console.log(e);
      stream.write(500);
    }
  } else {
    stream.write(404);
  }
};

