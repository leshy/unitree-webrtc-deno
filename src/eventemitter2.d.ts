// Custom type declaration for EventEmitter2
declare module "npm:eventemitter2@6.4.9" {
    class EventEmitter2 {
        constructor(options?: {
            wildcard?: boolean
            delimiter?: string
            newListener?: boolean
            removeListener?: boolean
            maxListeners?: number
            verboseMemoryLeak?: boolean
            ignoreErrors?: boolean
        })

        emit(event: string | symbol, ...args: any[]): boolean
        on(event: string | symbol, listener: (...args: any[]) => void): this
        off(event: string | symbol, listener: (...args: any[]) => void): this
        once(event: string | symbol, listener: (...args: any[]) => void): this
        many(
            event: string | symbol,
            timesToListen: number,
            listener: (...args: any[]) => void,
        ): this
        onAny(listener: (...args: any[]) => void): this
        offAny(listener: (...args: any[]) => void): this
        removeAllListeners(event?: string | symbol): this
        setMaxListeners(n: number): this
        listeners(event: string | symbol): ((...args: any[]) => void)[]
        listenersAny(): ((...args: any[]) => void)[]
    }

    export default EventEmitter2
}
