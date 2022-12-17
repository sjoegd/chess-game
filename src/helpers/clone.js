export default function clone(instance) {
    return Object.assign(
        Object.create(
            Object.getPrototypeOf(instance)
        ),
        JSON.parse(JSON.stringify(instance))
    )
}