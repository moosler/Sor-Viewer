(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],3:[function(require,module,exports){
(function (Buffer){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var customInspectSymbol =
  (typeof Symbol === 'function' && typeof Symbol.for === 'function')
    ? Symbol.for('nodejs.util.inspect.custom')
    : null

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    var proto = { foo: function () { return 42 } }
    Object.setPrototypeOf(proto, Uint8Array.prototype)
    Object.setPrototypeOf(arr, proto)
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  Object.setPrototypeOf(buf, Buffer.prototype)
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw new TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype)
Object.setPrototypeOf(Buffer, Uint8Array)

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(buf, Buffer.prototype)

  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}
if (customInspectSymbol) {
  Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += hexSliceLookupTable[buf[i]]
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(newBuf, Buffer.prototype)

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  } else if (typeof val === 'boolean') {
    val = Number(val)
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

// Create lookup table for `toString('hex')`
// See: https://github.com/feross/buffer/issues/219
var hexSliceLookupTable = (function () {
  var alphabet = '0123456789abcdef'
  var table = new Array(256)
  for (var i = 0; i < 16; ++i) {
    var i16 = i * 16
    for (var j = 0; j < 16; ++j) {
      table[i16 + j] = alphabet[i] + alphabet[j]
    }
  }
  return table
})()

}).call(this,require("buffer").Buffer)
},{"base64-js":2,"buffer":3,"ieee754":4}],4:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],5:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],6:[function(require,module,exports){
class BinReader {
    constructor(data, endian = 'LE') {
        this.data = data
        this.endian = endian;
        this.cursor = 0
    }

    async getArrayName(type, length) {
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

    async readString(len) {
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
    async readVal(length, type = "Int", position = this.cursor) {
        let end = position + length
        let newArrayBuffer = this.data.slice(position, end)
        let arrName = await this.getArrayName(type, length)
        let newArray = new window[arrName](newArrayBuffer)
        this.cursor = end;
        return newArray[0]
    }
    async read(length = 1) {
        return await this.readVal(length)
    }

    async readInt8(position) {
        return await this.readVal(1, "Int", position);
    }

    async readUInt8(position) {
        return await this.readVal(1, "uInt", position);
    }

    async readInt16(position) {
        return await this.readVal(2, "Int", position);
    }

    async readUInt16(position) {
        return await this.readVal(2, "uInt", position);
    }

    async readInt32(position) {
        return await this.readVal(4, "Int", position);
    }

    async readUInt32(position) {
        return await this.readVal(4, "uInt", position);
    }

    async readFloat32(position) {
        return await this.readVal(4, "Float", position);
    }

    async readFloat64(position) {
        return await this.readVal(8, "Float", position);
    }

    async readBigInt64(position) {
        return await this.readVal(8, "BigInt", position);
    }
    async readBigUint64(position) {
        return await this.readVal(8, "BigUint", position);
    }

    async seek(position) {
        this.cursor = position;
        return position;
    }
    async tell() {
        return this.cursor;
    }

}

module.exports = BinReader;
},{}],7:[function(require,module,exports){
class Cksum {
    constructor(name) {
        this.name = name;
        this.prefix = name.length + 1; // including \0
        this.params = {};

        this.units = [{
            "name": "checksum",
            "type": "uInt",
            "length": 2,
            "term": true, //termination \0
        }, ];
    }
}


module.exports = Cksum;
},{}],8:[function(require,module,exports){
class Datapoints {
    constructor(name, reader) {
        this.name = name;
        this.reader = reader;
        this.yMin = null;
        this.yMax = null;

        this.units = [{
                /**@todo error check if points numbers are same */
                "name": "number of Points",
                "type": "uInt",
                "length": 4,
                "term": true, //termination \0
            },
            {
                "name": "traces",
                "type": "Int",
                "length": 2,
                "term": true,
            },
            {
                "name": "repeat",
                "type": "uInt",
                "length": 4,
                "term": true,
            },
            {
                "name": "scaling",
                "type": "Int",
                "length": 2,
                "scale": 0.001,
                "term": true,
            },
        ];
    }
}

module.exports = Datapoints;
},{}],9:[function(require,module,exports){
class Fxdparam {
    constructor(name) {
        this.name = name;
        this.sol = 299792.458 / 1.0e6; //Speed of Light in km/usec
        this.units = [{
                "name": "date/time",
                "type": "uInt",
                "length": 4,
                "term": true, //termination \0
            },
            {
                "name": "unit",
                "type": "Char",
                "read": "String",
                "length": 2,
                "term": true,
            },
            {
                "name": "wavelength",
                "type": "uInt",
                "length": 2,
                "scale": 0.1,
                "pres": 1,
                "unit": "nm",
                "term": true,
            },
            {
                "name": "acquisition offset",
                "type": "Int",
                "length": 4,
                "term": true,
            },
            {
                "name": "acquisition offset distance",
                "type": "Int",
                "length": 4,
                "term": true,
            },
            {
                /**@todo the next three parameters are repeated according to the number of entries) */
                "name": "number of pulse width entries",
                "type": "uInt",
                "length": 2,
                "term": true,
            },
            {
                "name": "pulse width",
                "type": "uInt",
                "length": 2,
                "pres": 0,
                "unit": "ns",
                "term": true,
            },
            {
                "name": "sample spacing",
                "type": "uInt",
                "scale": 1e-8,
                "unit": "usec",
                "length": 4,
                "term": true,
            },
            {
                "name": "num data points",
                "type": "uInt",
                "length": 4,
                "term": true,
            },
            {
                "name": "index",
                "type": "uInt",
                "length": 4,
                "scale": 1e-5,
                "pres": 6,
                "term": true,
            },
            {
                "name": "BC",
                "type": "uInt",
                "scale": -0.1,
                "pres": 2,
                "unit": "dB",
                "length": 2,
                "term": true,
            },
            {
                "name": "num average",
                "type": "uInt",
                "length": 4,
                "term": true,
            },
            {
                "name": "averaging time",
                "type": "uInt",
                "length": 2,
                "scale": 0.1,
                "pres": 0,
                "unit": "sec",
                "term": true,
            },
            {
                "name": "range",
                "type": "uInt",
                "length": 4,
                "scale": 2e-5,
                "pres": 6,
                "unit": "km",
                "func": ["tDx"],
                "params": [
                    ["index", "sample spacing", "num data points"]
                ],
                "result": "append",
                "term": true,
            },
            {
                "name": "acquisition range distance",
                "type": "Int",
                "length": 4,
                "term": true,
            },
            {
                "name": "front panel offset",
                "type": "Int",
                "length": 4,
                "term": true,
            },
            {
                "name": "noise floor level",
                "type": "uInt",
                "length": 2,
                "term": true,
            },
            {
                "name": "noise floor scaling factor",
                "type": "Int",
                "length": 2,
                "term": true,
            },
            {
                "name": "power offset first point",
                "type": "uInt",
                "length": 2,
                "term": true,
            },
            {
                "name": "loss thr",
                "type": "uInt",
                "length": 2,
                "scale": 0.001,
                "pres": 3,
                "unit": "dB",
                "term": true,
            },
            {
                "name": "refl thr",
                "type": "uInt",
                "length": 2,
                "scale": -0.001,
                "pres": 3,
                "unit": "dB",
                "term": true,
            },
            {
                "name": "EOT thr",
                "type": "uInt",
                "length": 2,
                "scale": 0.001,
                "pres": 3,
                "unit": "dB",
                "term": true,
            },
            {
                "name": "trace type",
                "type": "Char",
                "read": "String",
                "append": true,
                "length": 2,
                "term": true,
            },
            {
                "name": "X1",
                "type": "Int",
                "length": 4,
                "term": true,
            },
            {
                "name": "Y1",
                "type": "Int",
                "length": 4,
                "term": true,
            },
            {
                "name": "X2",
                "type": "Int",
                "length": 4,
                "term": true,
            },
            {
                "name": "Y2",
                "type": "Int",
                "length": 4,
                "term": true,
            },
        ];
    }

    /**
     * 
     * @param {*} arr should contain the params
     * return obj should contain an Result parameter
     * all other parameter will be set in obj
     */
    async tDx(arr) {
        let index = arr[0];
        let sapce = arr[1];
        let dataPt = arr[2];
        let ior = parseFloat(index); //index of refraction
        let sasp = sapce;
        if (isNaN(sapce)) {
            sasp = sapce.split(' ')[0];
        }
        let dx = parseFloat(sasp) * this.sol / ior;
        let obj = {
            "dx": dx,
            "ior": ior,
            "sol": this.sol,
            "resolution": (dx * 1000),
            "result": (dx * dataPt),
        }
        return obj;
    }
}

module.exports = Fxdparam;
},{}],10:[function(require,module,exports){
class Genparam {
    constructor(name) {
        this.name = name;
        this.prefix = name.length + 1; // including \0
        this.params = {};
        this.units = [{
                "name": "lang",
                "type": "String",
                "length": 2,
                "term": true, //termination \0
            },
            {
                "name": "cable ID",
                "type": "String",
                "length": 0,
                "term": true,
            },
            {
                "name": "fiber ID",
                "type": "String",
                "length": 0,
                "term": true,
            },
            {
                "name": "fiber type",
                "type": "Char",
                "read": "uInt",
                "length": 2,
                "term": true,
            },
            {
                "name": "wavelength",
                "type": "uInt",
                "length": 2,
                "unit": "nm",
                "term": true,
            },
            {
                "name": "location A",
                "type": "String",
                "length": 0,
                "term": true,
            },
            {
                "name": "location B",
                "type": "String",
                "length": 0,
                "term": true,
            },
            {
                "name": "cable|fiber type",
                "type": "String",
                "length": 0,
                "term": true,
            },
            {
                "name": "build condition",
                "type": "Char",
                "read": "String",
                "length": 2,
                "append": false,
                "term": false,
            },
            {
                "name": "user offset",
                "type": "Int",
                "length": 4,
                "term": true,
            },
            {
                "name": "user offset distance",
                "type": "Int",
                "length": 4,
                "term": true,
                "version": 2,
            },
            {
                "name": "operator",
                "type": "String",
                "length": 0,
                "term": true,
            },
            {
                "name": "comments",
                "type": "String",
                "length": 0,
                "term": true,
            },
        ];
    }
}

module.exports = Genparam;
},{}],11:[function(require,module,exports){
class Keyevent {
    constructor(name) {
        this.name = name;
        this.eventMap = new Event();
        this.summaryMap = new Summaryevent();
        this.units = [{
            "name": "event number",
            "type": "uInt",
            "length": 2,
            "term": true, //termination \0
            "func": ['loopEvents', 'getSummary'],
            "numCalls": ['this', 1],
            "result": "numCalls",
            "propNames": ["events", "summary"],
            "params": [
                ['FxdParams.ior',
                    'FxdParams.sol'
                ],
                []
            ],
        }, ];
    }
    async loopEvents(arr) {
        let ior = arr[0];
        let sol = arr[1];
        let factor = 1e-4 * sol / parseFloat(ior);
        this.eventMap.factor = factor;
        this.summaryMap.factor = factor;
        return {
            'name': 'events',
            'obj': this.eventMap
        };
    }
    async getSummary() {
        return {
            'name': 'summary',
            'obj': this.summaryMap
        };
    }
}

class Summaryevent {
    constructor() {
        this.params = {};
        this.factor = 0;
        this.units = [{
                "name": "total loss",
                "type": "Int",
                "length": 4,
                "pres": 3,
                "scale": 0.001,
            },
            {
                "name": "loss start",
                "type": "Int",
                "length": 4,
                "pres": 6,
                "mult": "factor",
            },
            {
                "name": "loss end",
                "type": "uInt",
                "length": 4,
                "pres": 6,
                "mult": "factor",
            },
            {
                "name": "ORL",
                "type": "uInt",
                "length": 2,
                "scale": 0.001,
                "pres": 3,
            },
            {
                "name": "ORL start",
                "type": "Int",
                "length": 4,
                "pres": 6,
                "mult": "factor",
            },
            {
                "name": "ORL finish",
                "type": "uInt",
                "length": 4,
                "pres": 6,
                "mult": "factor",
            },
        ];
    }
}

class Event {
    constructor() {
        this.params = {};
        this.factor = 0;
        this.units = [{
                "name": "number",
                "type": "uInt",
                "length": 2,
            },
            {
                "name": "distance",
                "type": "uInt",
                "length": 4,
                "mult": "factor",
            },
            {
                "name": "slope",
                "type": "Int",
                "length": 2,
                "pres": 3,
                "scale": 0.001,
            },
            {
                "name": "splice",
                "type": "Int",
                "length": 2,
                "pres": 3,
                "scale": 0.001,
            },
            {
                "name": "refl loss",
                "type": "Int",
                "length": 4,
                "pres": 3,
                "scale": 0.001,
            },
            {
                "name": "event type",
                "type": "String",
                "length": 8,
                "func": ["eventMap"],
                "params": [
                    ['this']
                ],
                "result": "append",
            },
            {
                "name": "end of prev",
                "type": "uInt",
                "length": 4,
                "pres": 3,
                "mult": "factor",
            },
            {
                "name": "start of curr",
                "type": "uInt",
                "length": 4,
                "pres": 3,
                "mult": "factor",
            },
            {
                "name": "end of curr",
                "type": "uInt",
                "length": 4,
                "pres": 3,
                "mult": "factor",
            },
            {
                "name": "start of next",
                "type": "uInt",
                "length": 4,
                "pres": 3,
                "mult": "factor",
            },
            {
                "name": "peak",
                "type": "uInt",
                "length": 4,
                "pres": 3,
                "mult": "factor",
            },
            {
                "name": "comments",
                "type": "String",
                "length": 0,
            },
        ];
    }
    async eventMap(arr) {
        let value = arr[0];
        let pattern = "(.)(.)9999LS";
        let match = value.match(pattern);
        let res = value;
        if (match != null) {

            res += " ";
            switch (match[2]) {
                case 'A':
                    res += "manual";
                    break;
                case 'E':
                    res += "end";
                    break;
                default:
                    res += "auto";
                    break;
            }


            res += " ";
            let cInt = parseInt(match[1]);
            switch (cInt) {
                case 0:
                    res += "loss/drop/gain";
                    break;
                case 1:
                    res += "reflection";
                    break;
                case 2:
                    res += "multiple";
                    break;
                default:
                    res += "unknown";
                    break;
            }
        }
        let obj = {
            "result": res,
        }
        return obj;
    }
}

module.exports = Keyevent;
},{}],12:[function(require,module,exports){
//For Node Version
if (typeof module !== "undefined" && module.exports) {
  var BinaryFile = require("binary-file");
}

const BinReader = require("./binreader");

const UnitMapping = require("./unitmapping");
const Proxy = require("./proxy");
const Points = require("./points");
const Cksum = require("./cksum");

class Block {
  constructor(name, version, size, pos, order) {
    this.name = name;
    this.version = version;
    this.size = size;
    this.pos = pos;
    this.order = order;
  }
}

class Parser {
  constructor(path, config, data = {}) {
    this.config = config;
    this.path = path;
    this.bf = {};
    this.result = {
      params: {},
      points: {},
    };
    this.fileInfo = {};
    this.data = data;
    this.unitMapping = new UnitMapping();
  }
  async run() {
    try {
      if (this.config.browserMode) {
        this.bf = new BinReader(this.data);
      } else {
        this.bf = new BinaryFile(this.path, "r", true);
        await this.bf.open();
      }
      if (this.config.debug) console.log("File opened");
      await this.setVersion();
      await this.setMap();

      await this.parseParams("GenParams");
      await this.parseParams("SupParams");
      await this.parseParams("FxdParams");
      await this.parseParams("KeyEvents");

      await this.parseParams("DataPts");
      await this.parsePoints("Points");

      await this.parseParams("Cksum");
      // console.log(this.result);
      // console.log(this.fileInfo);
      if (!this.config.browserMode) await this.bf.close();
      if (this.config.debug) console.log("File closed");
      return this.result;
    } catch (err) {
      console.log(`There was an error: ${err}`);
    }
  }

  async parsePoints(name) {
    let pointsClass = new Points(name, this, this.config.devMode);
    let pointNumber = this.result.params["DataPts"]["number of Points"];
    let scale = this.result.params["DataPts"]["scaling"];
    let resolution = this.result.params["FxdParams"]["resolution"];
    let result = await pointsClass.loopPoints(pointNumber, scale, resolution);
    this.result.points = result;
  }

  async parseParams(name) {
    await this.checkBlockAndSetCursor(name);
    let block = new Proxy(name);
    let result = await this.parseBlock(block);
    this.result.params[name] = result;
  }

  async parseBlock(obj) {
    let results = {};
    for (const unit of obj.units) {
      try {
        let result = "";
        if (unit.type === "Char") {
          result = await this.parseCommand(unit, "read");
          let append = false;
          if (unit.hasOwnProperty("append")) {
            append = unit.append;
          }
          result = await this.unitMapping.getMapping(result, append);
        } else {
          result = await this.parseCommand(unit);
        }

        let parsedResult = await this.parseResult(result, unit, obj);
        results[unit.name] = await this.addUnit(parsedResult, unit);
        if (unit.hasOwnProperty("func")) {
          let resultObj = await this.callFunction(
            unit,
            obj,
            results,
            parsedResult
          );
          results = await this.convertResult(unit, resultObj, results);
        }
      } catch (error) {
        throw (
          "Something went wront by reading unit: " + unit.name + ": " + error
        );
      }
    }
    return results;
  }

  async convertResult(unit, newRes, results) {
    if (unit["result"] == "append") {
      results = await this.setBlockInfo(unit, newRes, results);
    } else if (unit["result"] == "numCalls") {
      let keys = Object.keys(newRes);
      for (let index = 0; index < keys.length; index++) {
        const element = keys[index];
        results[element] = newRes[element];
      }
    }
    return results;
  }

  async parseResult(result, unit, obj) {
    if (unit.hasOwnProperty("scale")) {
      result *= unit.scale;
    }
    if (unit.hasOwnProperty("pres")) {
      result = result.toFixed(unit.pres);
    }
    if (unit.hasOwnProperty("mult")) {
      let propName = unit.mult;
      let multi = obj[propName];
      result = (result * multi).toFixed(4);
    }
    return result;
  }

  async addUnit(result, unit) {
    if (unit.hasOwnProperty("unit")) {
      result = result + " " + unit.unit;
    }
    return result;
  }

  async callFunction(unit, ref, results, rThis) {
    await this.functionChecks(unit);
    let res = {};
    for (let index = 0; index < unit.func.length; index++) {
      const element = unit.func[index];
      let params = await this.getValuesFromBlock(
        results,
        unit.params[index],
        rThis
      );
      let resultObj = await ref[element](params);
      if (unit.hasOwnProperty("numCalls")) {
        let num = unit.numCalls[index];
        if (unit.numCalls[index] === "this") {
          num = rThis;
        }
        // else if (!isNaN(unit.numCalls[index])) {
        //     num = results[unit.numCalls];
        // }
        let block = resultObj.obj;
        let blockName = resultObj.name;

        let blockResult = await this.loopBlock(num, block);
        if (unit.hasOwnProperty("propNames")) {
          let propName = unit.propNames[index];
          this.result[propName] = blockResult;
        } else {
          res[blockName] = blockResult;
        }
      } else {
        res = {
          ...resultObj,
        };
      }
    }
    return res;
  }

  async functionChecks(unit) {
    if (!unit.hasOwnProperty("params")) {
      throw "No Params defined for Block: " + unit.name;
    }
    if (!unit.hasOwnProperty("result")) {
      throw "No result defined for Block call in: " + unit.name;
    }
    if (unit.func.length !== unit.params.length) {
      throw "Different amounts of functions vs params in: " + unit.name;
    }
  }

  async loopBlock(num, block) {
    let values = [];
    for (let i = 0; i < num; i++) {
      let param = await this.parseBlock(block);

      await values.push(param);
    }
    if (values.length === 1) {
      return values[0];
    }
    return values;
  }

  async setBlockInfo(unit, newRes, results) {
    let name = unit.name;
    for (const key in newRes) {
      if (newRes.hasOwnProperty(key)) {
        let element = newRes[key];
        if (key === "result") {
          if (unit.hasOwnProperty("unit")) {
            element += " " + unit.unit;
          }
          results[name] = element;
        } else {
          results[key] = element;
        }
      }
    }
    return results;
  }
  async getValuesFromBlock(obj, parArr, rThis) {
    let newArr = [];
    parArr.forEach((element) => {
      if (element.indexOf(".") !== -1) {
        let parts = element.split(".");
        let res = this.result.params[parts[0]][parts[1]];
        newArr.push(res);
      } else if (element === "this") {
        newArr.push(rThis);
      } else {
        if (!obj.hasOwnProperty(element)) {
          throw "Wrong Parameter Name";
        }
        newArr.push(obj[element]);
      }
    });
    return newArr;
  }

  async parseCommand(unit, typename = "type") {
    let result = "";
    if (unit[typename] === "String") {
      if (unit.length) {
        result = await this.bf.readString(unit.length);
      } else {
        result = await this.getString();
      }
    } else if (unit[typename] === "uInt") {
      result = await this.getUInt(unit.length);
    } else if (unit.type === "Int") {
      result = await this.getInt(unit.length);
    }
    return result;
  }

  async checkBlockAndSetCursor(name) {
    let info = this.fileInfo.blocks;
    if (!(name in info)) {
      if (name == "Cksum") {
        return false;
      }
      throw "blockName " + name + " not found!";
    }
    if (info[name]["version"] < 2) {
      throw "currently only Version 2 allowed!";
    }
    await this.bf.seek(info[name]["pos"]);
    let posInfo = await this.getString();
    if (posInfo != name) {
      throw "Wrong Header Start-Position for: " + name;
    }
  }

  async setVersion() {
    this.fileInfo.version = await this.getVersion();
    if (this.fileInfo.version < 2)
      throw "at this moment only Version 2 is supported";
    this.fileInfo.fullversion = await this.getFullVersion();
  }
  async setMap() {
    this.fileInfo.map = await this.getMap();
    this.fileInfo.blocks = await this.getBlocks(this.fileInfo.map);
  }
  async toFixedPoint(scale = 0.01, no = 2) {
    var val = await this.getUInt(2);
    return (val * scale).toFixed(no);
  }
  async getString() {
    if (this.config.browserMode) {
      return this.bf.getString();
    }
    var mystr = "";
    var byte = await this.bf.read(1);
    while (byte != "") {
      var tt = String(byte).charCodeAt(0);
      if (tt == 0) {
        break;
      }
      mystr += byte;
      byte = await this.bf.read(1);
    }
    return mystr;
  }
  async getUInt(nbytes = 2) {
    var val = null;
    if (nbytes == 2) {
      val = await this.bf.readUInt16();
    } else if (nbytes == 4) {
      val = await this.bf.readUInt32();
    } else {
      console.log(`parts.get_uint(): Invalid number of bytes ${nbytes}`);
      throw "Invalid bytes";
    }
    return val;
  }
  async getInt(nbytes = 2) {
    var val = null;
    if (nbytes == 2) {
      val = await this.bf.readInt16();
    } else if (nbytes == 4) {
      val = await this.bf.readInt32();
    } else {
      console.log(`parts.get_uint(): Invalid number of bytes ${nbytes}`);
      throw "Invalid bytes";
    }
    return parseInt(val);
  }
  async getVersion() {
    var mystr = await this.getString();
    let version = 2;
    if (mystr != "Map") {
      await this.bf.seek(0);
      version = 1;
    }
    return version;
  }
  async getFullVersion() {
    return await this.toFixedPoint();
  }
  async getMap() {
    var map = {};
    map.bytes = await this.getUInt(4);
    map.nBlocks = (await this.getUInt(2)) - 1;
    return map;
  }
  async getBlocks(map) {
    var blocks = {};
    var pos = map.bytes;
    for (var i = 0; i < map.nBlocks; i++) {
      let name = await this.getString();
      let ver = await this.toFixedPoint();
      let size = await this.getUInt(4);
      let block = new Block(name, ver, size, pos, i);
      blocks[name] = block;
      pos += size;
    }
    return blocks;
  }
}
module.exports = Parser;

},{"./binreader":6,"./cksum":7,"./points":13,"./proxy":14,"./unitmapping":17,"binary-file":19}],13:[function(require,module,exports){
const Cksum = require("./cksum");

class Points {
  constructor(name, parser, devMode) {
    this.name = name;
    this.parser = parser;
    this.devMode = devMode;
    this.pointMap = new PointsMap();
    this.yMin = null;
    this.yMax = null;
  }
  async loopPoints(num, scale, resolution = 1) {
    let yMin = Infinity;
    let yMax = -Infinity;
    let xScale = 1;
    if (this.devMode) {
      num = 100;
    }
    if (num >= 30000) {
      num = 30000;
    }
    let valArr = [];
    for (let i = 0; i <= num; i++) {
      let param = await this.parser.parseBlock(this.pointMap);
      let y = param.point * scale * 0.001;
      if (y >= yMax) {
        yMax = y;
      }
      if (y <= yMin) {
        yMin = y;
      }
      let x = (resolution * i * xScale) / 1000.0;
      valArr.push([x, y]);
    }
    let mult = yMax;
    let vals = await this.calcOffset(valArr, mult);

    let resObj = {
      yMin: yMin,
      yMax: yMax,
      points: vals,
    };
    this.yMin = yMin;
    this.yMax = yMax;
    return resObj;
  }
  async calcOffset(arr, mult) {
    let cvalArr = await arr.map(function (nested) {
      return nested.map(function (element, index) {
        if (index === 1) {
          return parseFloat((mult - element).toFixed(6));
        } else {
          return parseFloat(element.toFixed(6));
        }
      });
    });
    return cvalArr;
  }
}

class PointsMap {
  constructor() {
    this.params = {};
    this.units = [
      {
        name: "point",
        type: "uInt",
        length: 2,
        pres: 6,
      },
    ];
  }
}

module.exports = Points;

},{"./cksum":7}],14:[function(require,module,exports){
const GenParams = require('./genparams');
const SupParams = require('./supparams');
const FxdParams = require('./fxdparams');
const KeyEvents = require('./keyevents');
const DataPts = require('./datapts');
const Cksum = require('./cksum');

const classes = {
    GenParams,
    SupParams,
    FxdParams,
    KeyEvents,
    DataPts,
    Cksum,
};

class Proxy {
    constructor(className, opts = "") {
        return new classes[className](opts);
    }
}

module.exports = Proxy;
},{"./cksum":7,"./datapts":8,"./fxdparams":9,"./genparams":10,"./keyevents":11,"./supparams":16}],15:[function(require,module,exports){
const Parser = require('./parser');
var fs = require('fs');

/**
 * all values are encoded as little endian signed or unsigned integers, with floating - point values represented as scaled integers
 */
class SorReader {
    constructor(path, config = {}, data = {}) {
        this.path = path;
        this.defaultConfig = {
            debug: false, //Logging Infos to Console
            createJson: false, //write result in an JsonFile
            jsonPath: '.', //if createJson is true this is the path there the json file is saved
            jsonName: 'result.json', //if createJson is true this is the name of the json File
            devMode: false, //For Development: if true only the first 100 DataPoints are read
            browserMode: false //BrowserMode
        }
        this.config = {
            ...this.defaultConfig,
            ...config
        }
        this.data = data;
        this.parser = new Parser(this.path, this.config, this.data);
    }
    async parse() {
        try {
            let result = await this.parser.run();
            if (this.config.createJson) {
                let filename = this.config.jsonPath + '/' + this.config.jsonName;
                let data = JSON.stringify(result);
                fs.writeFileSync(filename, data);
            } else {
                return (result);
            }
        } catch (err) {
            console.log(`There was an parsing error: ${err}`);
        }
    }
}
//For Browser Version
if (typeof window != "undefined") {
    window.SorReader = SorReader
}
//For Node Version
module.exports = SorReader;
},{"./parser":12,"fs":1}],16:[function(require,module,exports){
class Supparam {
    constructor(name) {
        this.name = name;
        this.prefix = name.length + 1; // including \0
        this.params = {};
        this.units = [{
                "name": "supplier",
                "type": "String",
                "length": 0,
                "term": true, //termination \0
            },
            {
                "name": "OTDR",
                "type": "String",
                "length": 0,
                "term": true,
            },
            {
                "name": "OTDR S/N",
                "type": "String",
                "length": 0,
                "term": true,
            },
            {
                "name": "module",
                "type": "String",
                "length": 0,
                "term": true,
            },
            {
                "name": "module S/N",
                "type": "String",
                "length": 0,
                "term": true,
            },
            {
                "name": "software",
                "type": "String",
                "length": 0,
                "term": true,
            },
            {
                "name": "other",
                "type": "String",
                "length": 0,
                "term": true,
            },
        ];
    }
}

module.exports = Supparam;
},{}],17:[function(require,module,exports){
class UnitMapping {
    constructor() {
        this.mapping = {
            "mt": "meters",
            "km": "kilometers",
            "mi": "miles",
            "kf": "kilo-ft",
            'ST': "[standard trace]",
            'RT': "[reverse trace]",
            'DT': "[difference trace]",
            'RF': "[reference]",
            'BC': "(as-built)",
            'CC': "(as-current)",
            'RC': "(as-repaired)",
            'OT': "(other)",
            //REF: http://www.ciscopress.com/articles/article.asp?p=170740&seqNum=7
            651: "G.651 (50um core multimode)",
            652: "G.652 (standard SMF)",
            653: "G.653 (dispersion-shifted fiber)",
            654: "G.654 (1550nm loss-minimzed fiber)",
            655: "G.655 (nonzero dispersion-shifted fiber)",
        }
    }

    async getMapping(key, append = false) {
        let result = "";
        if (key in this.mapping) {
            let prefix = "";
            if (append) {
                prefix = key + " ";
            }
            result = prefix + this.mapping[key];
        }
        return result;
    }
}

module.exports = UnitMapping;
},{}],18:[function(require,module,exports){
(function (process){
const SorReader = require("./lib/sor.js");

let arg = process.argv;
let dir = "./";
let datapath = dir + "data";
let sample1 = "EXFO_FTB7400_1550_U.SOR";
let sample2 = "JDSU_MTS6000_1310_G.sor";
let sample3 = "sample1310_lowDR.sor";

let filename = sample3;

let filepath = datapath + "/" + filename;
let ext = filename
  .split(".")
  .pop()
  .toLowerCase();

let config = {
    createJson: true,
    devMode: true
}

if (ext !== "sor") {
  throw 'only Files with file extension ".sor" allowed';
}


let sor = new SorReader(filepath, config);

var result = "";
const logResult = async function() {
  result = await sor.parse();
  console.log(result);
};
logResult();

}).call(this,require('_process'))
},{"./lib/sor.js":15,"_process":5}],19:[function(require,module,exports){
'use strict';

const BinaryFile = require('./lib/binary-file');

module.exports = BinaryFile;

},{"./lib/binary-file":20}],20:[function(require,module,exports){
(function (Buffer){
'use strict';

const BINARY_LENGTH = {
  'Int8': 1,
  'UInt8': 1,
  'Int16': 2,
  'UInt16': 2,
  'Int32': 4,
  'UInt32': 4,
  'BigInt64': 8,
  'BigUInt64': 8,
  'Float': 4,
  'Double': 8
};

const denodeify = require('denodeify');
const fsOpen = denodeify(require('fs').open);
const fsRead = denodeify(require('fs').read);
const fsFstat = denodeify(require('fs').fstat);
const fsClose = denodeify(require('fs').close);
const fsWrite = denodeify(require('fs').write);

class BinaryFile {
  constructor (path, mode, littleEndian) {
    littleEndian = littleEndian || false;
    this.path = path;
    this.mode = mode;
    this.endianness = littleEndian ? 'LE' : 'BE';
    this.cursor = 0;
  }

  // Misc

  open () {
    return new Promise((resolve) => {
      fsOpen(this.path, this.mode).then((fd) => {
        this.fd = fd;
        resolve();
      });
    });
  }

  size () {
    return new Promise((resolve) => {
      fsFstat(this.fd).then((stat) => {
        resolve(stat.size);
      });
    });
  }

  seek (position) {
    this.cursor = position;
    return position;
  }

  tell () {
    return this.cursor;
  }

  close () {
    return new Promise((resolve) => {
      fsClose(this.fd, () => {
        resolve();
      });
    });
  }

  // Read

  read (length, position) {
    return new Promise((resolve) => {
      const buffer = new Buffer(length);
      fsRead(this.fd, buffer, 0, buffer.length, position || this.cursor).then((bytesRead) => {
        if (typeof position === 'undefined') this.cursor += bytesRead;
        resolve(buffer);
      });
    });
  }

  _readNumericType (type, position) {
    return new Promise((resolve) => {
      const length = BINARY_LENGTH[type];
      this.read(length, position).then((buffer) => {
        const value = buffer['read' + type + (length > 1 ? this.endianness : '')](0);
        resolve(value);
      });
    });
  }

  readInt8 (position) {
    return this._readNumericType('Int8', position);
  }

  readUInt8 (position) {
    return this._readNumericType('UInt8', position);
  }

  readInt16 (position) {
    return this._readNumericType('Int16', position);
  }

  readUInt16 (position) {
    return this._readNumericType('UInt16', position);
  }

  readInt32 (position) {
    return this._readNumericType('Int32', position);
  }

  readUInt32 (position) {
    return this._readNumericType('UInt32', position);
  }

  readInt64(position) {
    return this._readNumericType('BigInt64', position);
  }

  readUInt64(position) {
    return this._readNumericType('BigUInt64', position);
  }

  readFloat (position) {
    return this._readNumericType('Float', position);
  }

  readDouble (position) {
    return this._readNumericType('Double', position);
  }

  readString (length, position) {
    return new Promise((resolve) => {
      this.read(length, position).then((buffer) => {
        const value = buffer.toString();
        resolve(value);
      });
    });
  }

  // Write

  write (buffer, position) {
    return new Promise((resolve) => {
      fsWrite(this.fd, buffer, 0, buffer.length, position || this.cursor).then((bytesWritten) => {
        if (typeof position === 'undefined') this.cursor += bytesWritten;
        resolve(bytesWritten);
      });
    });
  }

  _writeNumericType (value, type, position) {
    const length = BINARY_LENGTH[type];
    const buffer = new Buffer(length);
    buffer['write' + type + (length > 1 ? this.endianness : '')](value, 0);
    return this.write(buffer, position);
  }

  writeInt8 (value, position) {
    return this._writeNumericType(value, 'Int8', position);
  }

  writeUInt8 (value, position) {
    return this._writeNumericType(value, 'UInt8', position);
  }

  writeInt16 (value, position) {
    return this._writeNumericType(value, 'Int16', position);
  }

  writeUInt16 (value, position) {
    return this._writeNumericType(value, 'UInt16', position);
  }

  writeInt32 (value, position) {
    return this._writeNumericType(value, 'Int32', position);
  }

  writeUInt32 (value, position) {
    return this._writeNumericType(value, 'UInt32', position);
  }

  writeInt64(value, position) {
    return this._writeNumericType(value, 'BigInt64', position);
  }

  writeUInt64(value, position) {
    return this._writeNumericType(value, 'BigUInt64', position);
  }

  writeFloat (value, position) {
    return this._writeNumericType(value, 'Float', position);
  }

  writeDouble (value, position) {
    return this._writeNumericType(value, 'Double', position);
  }

  writeString (value, position) {
    const buffer = new Buffer(value);
    return this.write(buffer, position);
  }
}

module.exports = BinaryFile;

}).call(this,require("buffer").Buffer)
},{"buffer":3,"denodeify":21,"fs":1}],21:[function(require,module,exports){
;(function(define){define(function(require,exports,module){

	function denodeify(nodeStyleFunction, filter) {
		'use strict';

		return function() {
			var self = this;
			var functionArguments = new Array(arguments.length + 1);

			for (var i = 0; i < arguments.length; i += 1) {
				functionArguments[i] = arguments[i];
			}

			function promiseHandler(resolve, reject) {
				function callbackFunction() {
					var args = new Array(arguments.length);

					for (var i = 0; i < args.length; i += 1) {
						args[i] = arguments[i];
					}

					if (filter) {
						args = filter.apply(self, args);
					}

					var error = args[0];
					var result = args[1];

					if (error) {
						return reject(error);
					}

					return resolve(result);
				}

				functionArguments[functionArguments.length - 1] = callbackFunction;
				nodeStyleFunction.apply(self, functionArguments);
			}

			return new Promise(promiseHandler);
		};
	}

	module.exports = denodeify;

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('denodeify',this));

},{}]},{},[18]);
