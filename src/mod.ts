import { durlinPsLex } from './parser.ts'

const testSourceCode = `

; EXAMPLE: EXPRESSION PARSER
; This is an example expression parser
; to build the ANTLR syntax.

enum TokenType ( Number Operator Open Close )

struct Token (
	type: TokenType
	value: union(string, int32)
)

condition IsNumber (c: rune) (
	within(range(48, 57) c)
)

condition IsSymbol (c: rune) (
	within(range(40, 47) c)
)

machine TokenizeExpression(expression: string) (
	data (
		idx: int32 = 0
		tokens: vector(Token) = {}
	)

	view Character (
		index(expression, $idx)
	)
	
	# Initial state.
	state initial (
		when_map (
			IsNumber(Character) -> (go Number),
			IsSymbol(Character) -> (go IsSymbol)
		)
	)
	
	state Number (
		ephemeral (
			value: string = "",
		)
		
		@value = append(@value, Character)
		$idx = $idx + 1
		when not(IsNumber(Character)) (
			insert($tokens, cast(@value))
			go initial
		)
	)
	
	state Symbol (
		ephemeral (
			value: string = ""
		)
	)
)


`

const tokens = durlinPsLex(testSourceCode)
console.log(tokens)
