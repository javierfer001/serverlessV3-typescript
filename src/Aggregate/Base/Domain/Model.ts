export class Model {
    static removeSpecialCharNumber(name?: string | undefined) {
        if (!name) return name
        return name.replace(/[^a-zA-Z ]/g, '')
    }

    static capitalize(str?: string | undefined): string | undefined {
        if (!str) return undefined
        str = str.toLowerCase()
        return str.replace(/\b(\w)/g, (s) => s.toUpperCase())
    }

    static alphabeticChar(str?: string | undefined) {
        if (!str) return undefined
        str = this.removeSpecialCharNumber(str)
        return this.capitalize(str)
    }
}
