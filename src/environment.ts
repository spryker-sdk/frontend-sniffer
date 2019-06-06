interface IPartialEnvironment {
    debug?: boolean
    collectOnly?: boolean
    takeOnly?: number
}

interface IEnvironment extends IPartialEnvironment {
    debug: boolean
    collectOnly: boolean
    takeOnly: number
}

const DEFAULT_ENVIRONMENT: IEnvironment = {
    debug: false,
    collectOnly: false,
    takeOnly: null
}

let environment: IEnvironment = {
    ...DEFAULT_ENVIRONMENT
}

export function set(partialEnvironment: IPartialEnvironment): void {
    environment = {
        ...DEFAULT_ENVIRONMENT,
        ...partialEnvironment
    }
}

export const get = () => ({
    ...environment
})
