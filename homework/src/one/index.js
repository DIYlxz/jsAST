const { Parser } = require('jison');

const parser = new Parser(`
%lex
identifier                              ("_"|{letter})({letter}|{digit}|"_")*
letter                                  {lowercase}|{uppercase}
lowercase                               [a-z]
uppercase                               [A-Z]
digit                                   [0-9]
number                                  {integer}{fraction}?
fraction                                "."{digit}+
integer                                 {digit}+
symbol									"+"|"*"|"("|")"

%%
\\s+                                    /* skip whitespace */
{number}                                return 'number'
{symbol}								return yytext 
{identifier}                            return 'name'
<<EOF>>                                 return 'EOF'
/lex

%left '+'
%left '*'

%start file 
%%
file
    : expression EOF { return $1 }
    ;

expression
    : number 						{ $$ = { type: 'number', value: Number($1)} }  // <- 公式(4)，
    | name                          { $$ = { type: 'variable', name: $1 } }
    | expression '+' expression  	{ $$ = { type: '+', left: $1, right: $3 } } // <- 公式(5)
    | expression '*' expression 	{ $$ = { type: '*', left: $1, right: $3 } } // <- 公式(6)
    | '(' expression ')' 			{ $$ = $2 }// <- 公式(7)
    ;
`);

const obj = parser.parse(`x * (3 * 4 + x)`);
console.log(obj);

function reduce(node) {
    if(node.type == "number") {
        return node;
    }else if(node.type == "variable") {
        return node;
    }else{
        const left = reduce(node.left);
        const right = reduce(node.right);
        if(left.type == "number" && left.type == right.type) {
            if(node.type == "+") {
                return {type: "number", value: left.value + right.value};
            }else if(node.type == "*") {
                return {type: "number", value: left.value * right.value};
            }
        }else {
            return {type: node.type, left, right}
        }
    }
}

function execute(node, env) {
    if(node.type === "number") {
        return node.value;
    }else if(node.type === "variable") {
        const value = env[node.name];
        if(typeof value === "number") {
            return value;
        }
        throw new Error(`${node.name}变量没有找到`);
    }else if(node.type === "+") {
        return execute(node.left, env) + execute(node.right, env);
    }else if(node.type === "*") {
        return execute(node.left, env) * execute(node.right, env);
    }
}

const reducedAst = reduce(obj);
console.log(reducedAst);

console.log(execute(reducedAst, { x: 1 }));