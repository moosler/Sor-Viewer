export class BinReader {
    data: object|any;
    endian: string;
    cursor: number;
    constructor(data: object, endian = 'LE') {
        this.data = data
        this.endian = endian;
        this.cursor = 0
    }

    async getArrayName(type: string, length: number) {
        let len = length * 8
        let name = ""
        if (type == "uInt") {
            name = "Uint" + len + "Array";
        } else if (type == "Int") {
            name = "Int" + len + "Array";
        } else if (type == "Float") {
            name = "Float" + len + "Array";
        } else if (type == "BigInt") {
            name = "BigInt" + len + "Array";
        } else if (type == "BigInt") {
            name = "BigUint" + len + "Array";
        }
        return name
    }

    async readString(len: number) {
        let str = "";
        for (let index = 0; index < len; index++) {
            var byte = await this.readVal(1);
            str += String.fromCharCode(byte);
        }
        return str;
    }

    async getString() {
        var str = "";
        var byte = await this.readVal(1);
        while (byte != 0 && byte <= 128) {
            str += String.fromCharCode(byte);
            byte = await this.read(1);
        }
        return str;
    }
    async readVal(length: number, type = "Int", position = this.cursor) {
        let end = position + length
        let newArrayBuffer = this.data.slice(position, end)
        let arrName:string = await this.getArrayName(type, length)
        // @ts-ignore
        let newArray = new window[arrName](newArrayBuffer)
        this.cursor = end;
        return newArray[0]
    }
    async read(length = 1) {
        return await this.readVal(length)
    }

    async readInt8(position: number | undefined) {
        return await this.readVal(1, "Int", position);
    }

    async readUInt8(position: number | undefined) {
        return await this.readVal(1, "uInt", position);
    }

    async readInt16(position: number | undefined) {
        return await this.readVal(2, "Int", position);
    }

    async readUInt16(position: number | undefined) {
        return await this.readVal(2, "uInt", position);
    }

    async readInt32(position: number | undefined) {
        return await this.readVal(4, "Int", position);
    }

    async readUInt32(position: number | undefined) {
        return await this.readVal(4, "uInt", position);
    }

    async readFloat32(position: number | undefined) {
        return await this.readVal(4, "Float", position);
    }

    async readFloat64(position: number | undefined) {
        return await this.readVal(8, "Float", position);
    }

    async readBigInt64(position: number | undefined) {
        return await this.readVal(8, "BigInt", position);
    }
    async readBigUint64(position: number | undefined) {
        return await this.readVal(8, "BigUint", position);
    }

    async seek(position: number) {
        this.cursor = position;
        return position;
    }
    async tell() {
        return this.cursor;
    }

}