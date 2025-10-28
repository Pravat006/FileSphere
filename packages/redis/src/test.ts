import RedisClient from "./index"


async function init() {
    const client = await RedisClient.getInstance()

    await client.setValue("msg:2", "Hello world")

    const getData = await client.getValue("msg:1")

    console.log((getData))

}

init().catch(err => {
    console.error(err)
    process.exit(1)
})


