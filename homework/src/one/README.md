#  jison初学

目的：为开发一个js解释器打基础

##  起步

npm install jison --save-dev

node引入
const { Parser } = require('jison');



##  词法分析

词法分析分为两部分由%lex和/lex包围起来，以%%分隔开。

上一部分是声明部分：名字       正则

下一部分是匹配部分，用来匹配输入字符串将它转换成token

```javascript
%lex
word                 \\w+

%%
\\s+                 /* skip whitespace */
{word}               return 'WORD'
<<EOF>>              return 'EOF'
/lex
```



##  语法分析

也分为两部分%%分隔开

上一部分为语法声明部分，顺序跟优先级相关，写在后面的优先级越高

下一部分为表达式

```javascript
%left '+'
%left '*'

%start file 
%%
file
    : expression EOF { return $1 }
    ;

expression
    : number 								{ $$ = Number($1) } // <- 公式(4)，
    | expression '+' expression  			{ $$ = $1 + $3 } // <- 公式(5)
    | expression '*' expression 			{ $$ = $1 * $3 } // <- 公式(6)
    | '(' expression ')' 					{ $$ = $2 }// <- 公式(7)
    ;
```



##  抽象语法树

抽象语法树我们能看，计算机也好理解

```javascript
1 + 2 * 3

const ast: Expression = {
  type: '+',
  left: { type: 'number', value: 1, },
  right: {
    type: '*',
    left: { type: 'number', value: 2, },
    right: { type: 'number', value: 3},
  }
}
```

