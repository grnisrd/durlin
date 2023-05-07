// Data
// ====================================================

const reservedWords = [
  'condition',
  'data',
  'enum',
  'ephemeral',
  'machine',
  'state',
  'struct',
  'view',
  'when',
  'when_map',
]

const reservedSymbols = [
  '+',
  '-',
  '*',
  '/',
  '@',
  '$',
  '.',
  ',',
  ':',
  '=',
  '->',
].sort((a, b) => b.length - a.length)

// Lexer
// ====================================================

export enum DurlinPsLexType {
  String,
  Number,
  Identifier,
  Keyword,
  Symbol,
}

export type DurlinPsLexToken = [
  type: DurlinPsLexType,
  value: number | string | boolean,
  line: number,
]

const range = (i: number, min: number, max: number) => i >= min && i <= max
const isnum = (i: number) => range(i, 48, 57)
const ishex = (i: number) => isnum(i) || range(i, 65, 70) || range(i, 97, 102)
const isalpha = (i: number) => range(i, 65, 90) || range(i, 97, 122)
const isalphanum = (i: number) => isnum(i) || isalpha(i)
const isidentifier = (i: number) => isalpha(i) || i === 95

export function durlinPsLex(input: string): DurlinPsLexToken[] {
  let i = 0
  let line = 1
  const tokens = [] as DurlinPsLexToken[]

  /**
   * If true, input has ended.
   */
  const eof = () => i >= input.length

  /**
   * Escapes a `\` character.
   */
  const escape = () => {
    const map = {
      'n': '\n',
    }

    i++ // Skip over \.
    const mapval = map[input[i] as keyof typeof map]
    if (mapval !== undefined) {
      return i++, mapval
    } else {
      // TODO: dec/hex/unicode escapes
      return i++, input[i]
    }
  }

  lexstart:
  while (!eof()) {
    const char = input[i]
    const code = char.charCodeAt(0)

    // Try parse comment.
    if (code === 35) {
      while (!eof() && input[i] !== '\n') {
        i++
      }
      line++
      continue
    }

    // Try parse identifier/keyword.
    if (isidentifier(code)) {
      let value = ''
      while (!eof() && isidentifier(input[i].charCodeAt(0))) {
        value += input[i++]
      }
      tokens.push([
        reservedWords.includes(value)
          ? DurlinPsLexType.Keyword
          : DurlinPsLexType.Identifier,
        value,
        line,
      ])
      continue
    }

    // Try parse number.
    if (isnum(code)) {
      if (input[i + 1].toLowerCase() === 'x') {
        i += 2 // Skip over '0x'
        let value = ''
        while (ishex(input[i].charCodeAt(0))) {
          value += input[i++]
        }
        tokens.push([DurlinPsLexType.Number, parseInt(value, 16), line])
        continue
      } else if (input[i + 1].toLowerCase() === 'b') {
        i += 2 // Skip over '0b'
        let value = ''
        while (range(input[i].charCodeAt(0), 30, 31)) {
          value += input[i++]
        }
        tokens.push([DurlinPsLexType.Number, parseInt(value, 2), line])
        continue
      } else {
        let isfloat = false
        let value = ''
        while (isnum(input[i].charCodeAt(0)) || input[i] === '.') {
          if (input[i] === '.') {
            if (isfloat) {
              throw new Error(`Malformed float near line ${line}`)
            }
            isfloat = true
            value += '.'
            i++
          } else {
            value += input[i++]
          }
        }
        tokens.push([DurlinPsLexType.Number, parseFloat(value), line])
        continue
      }
    }

    // Try parse string.
    if (code === 34) {
      let value = ''
      while (input[i] !== '"') {
        if (input[i] === '\\') {
          value += escape()
        } else {
          value += input[i++]
        }
      }
      i++ // Skip over ".
      tokens.push([DurlinPsLexType.String, value, line])
      continue
    }

    // Try parse whitespace.
    if (char === '\n' || /\s/.test(char)) {
      while (input[i] === '\n' || /\s/.test(input[i])) {
        if (input[i] === '\n') {
          line++
        }
        i++
      }
      continue
    }

    // Try parse parenthesis.
    if (range(code, 40, 41)) {
      tokens.push([DurlinPsLexType.Symbol, input[i++], line])
      continue
    }

    // Try parse other symbols.
    let value = ''
    while (
      !eof()
    ) {
      if (
        (isalphanum(input[i].charCodeAt(0)) ||
          (/\s/.test(input[i])) ||
          input[i] === '_')
      ) {
        break
      }
      value += input[i++]
    }

    for (const symb of reservedSymbols) {
      if (symb === value) {
        tokens.push([DurlinPsLexType.Symbol, value, line])
        continue lexstart
      }
    }

    throw new Error(`Malformed symbol "${input[i]}" near line ${line}`)
  }

  return tokens
}

// Parser
// ====================================================

type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

interface Expression {
  readonly type: 'atom'
}

interface TypeExpression {
  readonly type: 'atom'
}

interface Condition {
  readonly args: StructDeclaration
  readonly stat: Statement
}

/**
 * Defines the declaration of a variable attached to a type.
 */
type VarDeclaration = [type: TypeExpression, defl: Expression | undefined]

/**
 * Maps fields to variable declarations.
 */
type StructDeclaration = Record<string, VarDeclaration>

interface StateDeclaration {
  readonly body: Statement[]
  readonly views: Record<string, Expression>
  readonly ephemeral: StructDeclaration
}

interface MachineDeclaration {
  readonly args: StructDeclaration
  readonly data: StructDeclaration
  readonly views: Record<string, Expression>
  readonly states: Record<string, StateDeclaration>
  readonly initial: StateDeclaration
}

export class Program {
  readonly conditions: Readonly<Record<string, Condition>>
  readonly machines: Readonly<Record<string, MachineDeclaration>>
  readonly structs: Readonly<Record<string, StructDeclaration>>
  readonly enums: Readonly<Record<string, string[]>>

  getCondition(name: string) {
    return this.conditions[name]
  }

  getMachine(name: string) {
    return this.machines[name]
  }

  getStruct(name: string) {
    return this.structs[name]
  }

  getEnum(name: string) {
    return this.enums[name]
  }

  constructor(
    _m: Record<string, MachineDeclaration>,
    _c: Record<string, Condition>,
    _s: Record<string, StructDeclaration>,
    _e: Record<string, string[]>,
  ) {
    this.machines = _m
    this.conditions = _c
    this.structs = _s
    this.enums = _e
  }
}

type StatementTypes = {
  GoStat: {
    readonly to: string
  }

  WhenStat: {
    readonly condition: Expression
    readonly body: Statement[]
  }
}

type StatementBase = {
  readonly line: number
  readonly type: keyof StatementTypes
}

export type Statement<T extends keyof StatementTypes | undefined = undefined> =
  T extends keyof StatementTypes ? StatementBase & StatementTypes[T]
    : StatementBase

export function durlinPsParse(tokens: DurlinPsLexToken[]) {
  const machines: Record<string, MachineDeclaration> = {}
  const conditions: Record<string, Condition> = {}
  const structs: Record<string, StructDeclaration> = {}
  const enums: Record<string, string[]> = {}

  let i = 0

  /**
   * Returns whether we have arrived at the end of parse.
   */
  const eof = () => i >= tokens.length

  /**
   * Throw an error.
   */
  const error = (message: string) => {
    throw new Error(`:${tokens[i][2]}: ${message}`)
  }

  /**
   * Runs a test on the current token.
   */
  const test = (tester: (tk: DurlinPsLexToken, idx: number) => boolean) =>
    tester(tokens[i], i)

  /**
   * Runs a test and errors if it fails.
   */
  const assert = (
    t: Parameters<typeof test>[0],
    message: string,
  ) => {
    if (!test(t)) {
      error(message)
    }
    return true
  }

  /**
   * Skips to the next token.
   */
  const next = (n = 1) => void (i += n)

  /**
   * Skips to the next token if test passes. Returns current token.
   */
  const nextif = (t: Parameters<typeof test>[0]) => {
    const tk = tokens[i]
    if (test(t)) {
      next()
      return tk
    }
  }

  /**
   * Skips to the next token if assert passes. Returns current token.
   */
  const assertnextif = (
    t: Parameters<typeof test>[0],
    msg = 'Assertion failed',
  ) => {
    const tk = tokens[i]
    if (assert(t, msg)) {
      next()
      return tk
    }
    return (undefined as unknown as DurlinPsLexToken) // Unreachable. This is so to preserve return type.
  }

  /**
   * Test generators.
   */
  const t = {
    is:
      (type: keyof typeof DurlinPsLexType, value?: unknown) =>
      (t: DurlinPsLexToken) => {
        if (t[0] === DurlinPsLexType[type]) {
          if (value) {
            return t[1] === value
          }
          return true
        }
        return false
      },
  }

  /**
   * Parse a condition.
   */
  const parseCondition = () => {
    // TODO
    return (undefined as unknown) as Condition
  }

  /**
   * Parse a view.
   */
  const parseView = () => {
    // TODO
    return (undefined as unknown) as Expression
  }

  /**
   * Parse a state.
   */
  const parseState = () => {
    // TODO
    return (undefined as unknown) as StateDeclaration
  }

  /**
   * Parse a structure. If `allowDefaultValues`, the structure
   * can have default values (such as in arguments).
   */
  const parseStruct = (allowDefaultValues = false): StructDeclaration => {
    assertnextif(t.is('Symbol', '('))
    // do stuff
    assertnextif(t.is('Symbol', ')'))
    return {}
  }

  /**
   * Parse a machine.
   */
  const parseMachine = () => {
    assertnextif(
      t.is('Keyword', 'machine'),
      'Machine declaration must start with "machine".',
    )

    const machineName = assertnextif(
      t.is('Identifier'),
      'Machine declaration must have an identifier.',
    )

    const machineDecl = {
      args: {},
      data: {},
      views: {},
      states: {},
      initial: undefined,
    } as Mutable<
      Omit<MachineDeclaration, 'initial'> & { initial?: StateDeclaration }
    >

    assertnextif(t.is('Symbol', '('))

    // Are we parsing arguments?
    if (test(t.is('Identifier'))) {
      i--
      machineDecl.args = parseStruct(true)
      assertnextif(t.is('Symbol', '('))
    }

    while (!test(t.is('Symbol', ')'))) {
      if (test(t.is('Keyword', 'data'))) {
        // Parse structure.
        next()
        const struct = parseStruct(true)
        for (const [fname, fval] of Object.entries(struct)) {
          if (machineDecl.data[fname] !== undefined) {
            error(`Duplicate declaration of data variable "${fname}"`)
          }
          machineDecl.data[fname] = fval
        }
      } else if (test(t.is('Keyword', 'view'))) {
        // Parse view condition.
        next()
        const viewname = assertnextif(t.is('Identifier'))[1] as string
        if (machineDecl.views[viewname] !== undefined) {
          error(`Duplicate declaration of view "${viewname}"`)
        }
        machineDecl.views[viewname] = parseView()
      } else if (test(t.is('Keyword', 'state'))) {
        // Parse state.
        next()
        const statename = assertnextif(t.is('Identifier'))[1] as string
        if (machineDecl.states[statename] !== undefined) {
          error(`Duplicate declaration of state "${statename}"`)
        }
        machineDecl.states[statename] = parseState()
      }
    }
  }

  return new Program(machines, conditions, structs, enums)
}
