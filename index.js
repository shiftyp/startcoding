const proto = require('protobufjs')

const main = async() => {
  const info = await proto.load('./packages/frontend/types/src/changeset.proto')
  const changeset = info.lookup('types.ChangeSet')
  const data = {
    "layers": [
      {
        "index": -1,
        "layer": [
          {
            "kind": "backdrop",
            "url": "https://fake.com/image.png",
            "style": "cover"
          }
        ]
      },
      {
        "index": 0,
        "layer": []
      }
    ]
  };
  const err = changeset.verify(data)
  if (err) throw new Error(err)
  let message = changeset.create(data)
  let buffer = changeset.encode(message).finish()
  message = changeset.decode(buffer)
  const data2 = changeset.toObject(message)
  console.log(data2)
}

main()