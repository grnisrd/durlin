grammar durlin;

// Entry point
file: (
		comment
		| enumDecl
		| structDecl
		| conditionDecl
		| machineDecl
	)* EOF;

// Comments
comment: ';' ~(NEWLINE)* NEWLINE;

// Enum
enumDecl: 'enum' ID '(' (ID (',' ID)*)? ')';

// Struct
structDecl: 'struct' ID '(' (field (',' field)*)? ')';

field: ID ':' type;

// Condition
conditionDecl:
	'condition' ID '(' (param (',' param)*)? ')' '(' expression ')' (
		';'
	)?;

// Machine
machineDecl:
	'machine' ID ('(' (param (',' param)*)? ')')? '(' (
		machineContent
	)* ')';

machineContent:
	'data' '(' (variable (',' variable)*)? ')'
	| 'view' ID '(' expression ')'
	| 'state' ID stateContent;

stateContent:
	'(' ('ephemeral' '(' (variable (',' variable)*)? ')')? (
		statement
		| when
		| when_map
	)* ')';

variable: ID ':' type '=' expression;

param: ID ':' type;

type: baseType | genericType;

baseType: 'int32' | 'uint8';

genericType: ('vector' | 'union') '(' type (',' type)* ')';

// Statements
statement: (assign | go);

assign: '@' ID '=' expression;

go: 'go' ID;

// When
when: 'when' expression '(' (statement | go)* ')';

// When_map
when_map:
	'when_map' '(' (patternMatch (',' patternMatch)*)? ')';

patternMatch: functionCall '->' '(' (statement | go)* ')';

// Expressions
expression:
	expression '==' expression
	| expression '!=' expression
	| expression '<' expression
	| expression '<=' expression
	| expression '>' expression
	| expression '>=' expression
	| expression '+' expression
	| expression '-' expression
	| expression '*' expression
	| expression '/' expression
	| expression '%' expression
	| expression '&' expression
	| expression '|' expression
	| expression '^' expression
	| expression '<<' expression
	| expression '>>' expression
	| '!' expression
	| '~' expression
	| '-' expression
	| '(' expression ')'
	| NUMBER
	| ID
	| functionCall
	| '@' ID
	| '$' ID
	| '{' (expression (',' expression)*)? '}';

functionCall: ID '(' (expression (',' expression)*)? ')';

// Newline
NEWLINE: '\r' '\n' | '\n' | '\r';

// Lexer rules
ID: [a-zA-Z_][a-zA-Z0-9_]*;

NUMBER: (
		'0x' [0-9A-Fa-f]+
		| '0o' [0-7]+
		| '0b' [01]+
		| [0-9]+ '_'? [0-9]* ('.' [0-9]+)? (
			('e' | 'E') ('+' | '-')? [0-9]+
		)?
	);

WS: [ \t\r\n]+ -> skip;
