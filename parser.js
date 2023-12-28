
const fs = require('fs');

const TokenType = {
    KEYWORD: 'KEYWORD',
    IDENTIFIER: 'IDENTIFIER',
    OPERATOR: 'OPERATOR',
    INTEGER: 'INTEGER',
    STRING: 'STRING',
    LPAREN: 'OPENEDPAREN',
    RPAREN: 'CLOSEDPAREN',
    LBRACE: 'OPENEDBRACE',
    RBRACE: 'CLOSEDBRACE',
    LBRACKET: 'OPENEDBRACKET',
    RBRACKET: 'CLOSEDBRACKET',
    SEMICOLON: 'SEMICOLON',
    END: 'END',
};

class Token {
    constructor(type, value, line) {
        this.type = type;
        this.value = value;
        this.line = line;
    }
}

class Scanner {
    constructor(input) {
        this.input = input;
        this.currentPosition = 0;
        this.currentLine = 1; // Track the current line number
        this.keywords = [
            'int', 'char', 'float', 'double', 'if', 'else', 'for', 'while', 'do', 'return',
            'sizeof', 'struct', 'break', 'continue', 'switch', 'case', 'default', 'void', 'main'
        ];
    }

    isAlphaNumeric(char) {
        return /[a-zA-Z0-9_]/.test(char);
    }

    getNextToken() {
        while (this.currentPosition < this.input.length) {
            let char = this.input[this.currentPosition];

            if (/\s/.test(char)) {
                if (char === '\n') {
                    this.currentLine++; // Increment line number on newline
                }
                this.currentPosition++;
                continue;
            }

            if (/\d/.test(char)) {
                let value = '';
                while (/\d/.test(char)) {
                    value += char;
                    char = this.input[++this.currentPosition];
                }
                return new Token(TokenType.INTEGER, parseInt(value), this.currentLine);
            }

            if (char === '"') {
                let value = '';
                char = this.input[++this.currentPosition];
                while (char !== '"' && this.currentPosition < this.input.length) {
                    value += char;
                    char = this.input[++this.currentPosition];
                }
                if (char !== '"') {
                    throw new Error(`Unterminated string literal in line ${this.currentLine}`);
                }
                this.currentPosition++;
                return new Token(TokenType.STRING, value, this.currentLine);
            }

            if (this.isAlphaNumeric(char)) {
                let value = '';
                while (this.isAlphaNumeric(char)) {
                    value += char;
                    char = this.input[++this.currentPosition];
                }
                return new Token(this.keywords.includes(value) ? TokenType.KEYWORD : TokenType.IDENTIFIER, value, this.currentLine);
            }

            const operators = ['+', '-', '*', '/', '=', '==', '!=', '>', '<', '>=', '<=', '&&', '||', '&', '|', '^', '!', '~', '<<', '>>', '++', '--', '+=', '-=', '*=', '/='];
            for (const op of operators) {
                if (this.input.startsWith(op, this.currentPosition)) {
                    this.currentPosition += op.length;
                    return new Token(TokenType.OPERATOR, op, this.currentLine);
                }
            }

            if (char === '(') {
                this.currentPosition++;
                return new Token(TokenType.LPAREN, '(', this.currentLine);
            }
            if (char === ')') {
                this.currentPosition++;
                return new Token(TokenType.RPAREN, ')', this.currentLine);
            }
            if (char === '{') {
                this.currentPosition++;
                return new Token(TokenType.LBRACE, '{', this.currentLine);
            }
            if (char === '}') {
                this.currentPosition++;
                return new Token(TokenType.RBRACE, '}', this.currentLine);
            }
            if (char === '[') {
                this.currentPosition++;
                return new Token(TokenType.LBRACKET, '[', this.currentLine);
            }
            if (char === ']') {
                this.currentPosition++;
                return new Token(TokenType.RBRACKET, ']', this.currentLine);
            }
            if (char === ';') {
                this.currentPosition++;
                return new Token(TokenType.SEMICOLON, ';', this.currentLine);
            }

            throw new Error(`Invalid character: ${char} at line ${this.currentLine}`);
        }

        return new Token(TokenType.END, null, this.currentLine);
    }

    static fromFile(filename) {
        const input = fs.readFileSync(filename, 'utf-8');
        return new Scanner(input);
    }
}

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.currentTokenIndex = 0;
    }

    parseDeclaration(currentTokenIndex) {
        const token = this.tokens[currentTokenIndex+1];
        if (token.type === TokenType.KEYWORD && token.value === 'int') {
            this.currentTokenIndex++;
            this.parseVariableDeclarationOrAssignment(this.currentTokenIndex);
        } else {
            throw new Error(`Syntax Error: Expected int keyword for variable declaration at line ${token.line}`);
        }
    }
    
    parseVariableDeclarationOrAssignment(currentTokenIndex) {
        const token = this.tokens[currentTokenIndex+2];
        console.log(token)
        if (token.type === TokenType.IDENTIFIER) {
            this.currentTokenIndex++;
            const nextToken = this.tokens[this.currentTokenIndex+2];
            console.log(nextToken)
            if (nextToken.type === TokenType.SEMICOLON) {
                // Variable declaration without assignment
                this.currentTokenIndex++;
            } else if (nextToken.type === TokenType.OPERATOR && nextToken.value === '=') {
                // Variable assignment
                this.currentTokenIndex++;
                console.log
                this.parseExpression(this.currentTokenIndex);
                this.parseSemicolon(this.currentTokenIndex+1);
            } else {
                throw new Error(`Syntax Error: Expected ; or = after identifier in line ${token.line}`);
            }
        } else {
            throw new Error(`Syntax Error: Expected identifier for variable declaration or assignment in line ${token.line}`);
        }
    }
    parseExpression(currentTokenIndex) {
        const token = this.tokens[currentTokenIndex];
        console.log(token)
        if (token.type === TokenType.INTEGER || token.type === TokenType.IDENTIFIER) {
            this.currentTokenIndex++;
        } else {
            throw new Error(`Syntax Error: Expected integer or identifier in expression at line ${token.line}`);
        }
    }

    parseSemicolon(currentTokenIndex) {
        const token = this.tokens[currentTokenIndex+1];
        if (token.type === TokenType.SEMICOLON) {
            this.currentTokenIndex++;
            this.parseConditional(this.currentTokenIndex+2);
        } else {
            throw new Error(`Syntax Error: Expected semicolon at line ${token.line}`);
        }
    }

    parseConditional(currentTokenIndex) {
        const token = this.tokens[currentTokenIndex];
        if (token.type === TokenType.KEYWORD && token.value === 'if') {
            currentTokenIndex++;
            console.log(this.tokens[currentTokenIndex])
            this.parseParentheses(currentTokenIndex+1);
            let token = this.tokens[currentTokenIndex+6]
            console.log(token);
            if (token.type === TokenType.LBRACE){
                this.parseExpression(currentTokenIndex+7);
                token=this.tokens[currentTokenIndex+10]
                console.log(token)
                if (token.type === TokenType.SEMICOLON) {
                    this.currentTokenIndex++;
                } else {
                    throw new Error(`Syntax Error: Expected semicolon at line ${token.line}`);
                }
            }
            this.parseElse(currentTokenIndex+12);
            
        } else {
            throw new Error(`Syntax Error: Expected if keyword for conditional statement at line ${token.line}`);
        }
    }

    parseParentheses(currentTokenIndex) {
        const token = this.tokens[currentTokenIndex-1];
        if (token.type === TokenType.LPAREN) {
            this.currentTokenIndex++;
            this.parseExpression(currentTokenIndex);
            const closingToken = this.tokens[currentTokenIndex+4];
            console.log(closingToken)
            if (closingToken.type === TokenType.RPAREN) {
                return currentTokenIndex++;
            } else {
                throw new Error(`Syntax Error: Expected closing parenthesis at line ${closingToken.line}`);
            }
        } else {
            throw new Error(`Syntax Error: Expected opening parenthesis at line ${token.line}`);
        }
    }

    parseBlock() {
        const token = this.tokens[this.currentTokenIndex];
        if (token.type === TokenType.LBRACE) {
            this.currentTokenIndex++;
            const closingToken = this.tokens[this.currentTokenIndex+1];
            if (closingToken.type === TokenType.RBRACE) {
                this.currentTokenIndex++;
            } else {
                throw new Error(`Syntax Error: Expected closing brace at line ${closingToken.line} && ${closingToken.value}`);
            }
        } else {
            throw new Error(`Syntax Error: Expected opening brace at line ${token.line}`);
        }
    }

    parseElse(currentTokenIndex) {
        const token = this.tokens[currentTokenIndex];
        if (token.type === TokenType.KEYWORD && token.value === 'else') {
            this.currentTokenIndex = currentTokenIndex+1;
            const token = this.tokens[this.currentTokenIndex];
            if (token.type === TokenType.LBRACE) {
                console.log(this.tokens[this.currentTokenIndex])
                this.parseExpression(this.currentTokenIndex+1)
                const closingToken = this.tokens[this.currentTokenIndex+8];
                if (closingToken.type === TokenType.RBRACE) {
                    this.currentTokenIndex++;
                } else {
                    throw new Error(`Syntax Error: Expected closing brace at line ${closingToken.line}`);
                }
            } else {
                throw new Error(`Syntax Error: Expected opening brace at line ${token.line}`);
            }
            this.parseReturnStatement(this.currentTokenIndex);
        }
    }

    parseReturnStatement(currentTokenIndex) {
        const token = this.tokens[currentTokenIndex+4];
        if (token.type === TokenType.KEYWORD && token.value === 'return') {
            this.currentTokenIndex++;
            this.parseExpression(this.currentTokenIndex);
            if (this.tokens[this.currentTokenIndex+4].type === TokenType.SEMICOLON) {
                return;
            }
        } else {
            throw new Error(`Syntax Error: Unexpected token for return statement at line ${token.line}`);
        }
    }


    parse() {
        try {
            // Check for the presence of the main method
            const mainMethodToken = this.tokens[this.currentTokenIndex];
            if (mainMethodToken.type === TokenType.KEYWORD && mainMethodToken.value === 'int') {
                this.currentTokenIndex++;
                const mainIdentifierToken = this.tokens[this.currentTokenIndex];
                if (mainIdentifierToken.type === TokenType.KEYWORD && mainIdentifierToken.value === 'main') {
                    this.currentTokenIndex++;
                    const openingParenToken = this.tokens[this.currentTokenIndex];
                    if (openingParenToken.type === TokenType.LPAREN) {
                        this.currentTokenIndex++;
                        const closingParenToken = this.tokens[this.currentTokenIndex];
                        if (closingParenToken.type === TokenType.RPAREN) {
                            console.log(this.tokens[this.currentTokenIndex+1])
                            this.parseDeclaration(this.currentTokenIndex+1);
                        } else {
                            throw new Error(`Syntax Error: Expected closing parenthesis at line ${closingParenToken.line}`);
                        }
                    } else {
                        throw new Error(`Syntax Error: Expected opening parenthesis at line ${openingParenToken.line}`);
                    }
                } else {
                    throw new Error(`Syntax Error: Expected identifier 'main' at line ${mainMethodToken.line}`);
                }
            } else {
                throw new Error(`Syntax Error: Expected int keyword for main method declaration at line ${mainMethodToken.line}`);
            }

            console.log('Parsing successful. Code is accepted for the C Programming language.');
            fs.writeFileSync('outputparser.txt', 'Parsing successful. Code is accepted for the C Programming language.');
        } catch (error) {
            console.error('Error:', error.message);
            if (error.line) {
                console.log(`Error at line ${error.line}: ${error.message}`);
            }
            fs.writeFileSync('outputparser.txt', `Syntax Error: ${error.message}`);
        }
    }
}

const inputFilename = 'input.txt';
const outputFilename = 'outputparser.txt';

try {
    const scanner = Scanner.fromFile(inputFilename);
    const outputTokens = [];

    let token = scanner.getNextToken();
    while (token.type !== TokenType.END) {
        outputTokens.push(token);
        token = scanner.getNextToken();
    }

    const parser = new Parser(outputTokens);
    parser.parse();
} catch (error) {
    console.error('Error:', error.message);
    fs.writeFileSync(outputFilename, `Syntax Error: ${error.message}`);
}
