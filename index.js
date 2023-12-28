const fs = require('fs');
// Token types
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

  
// Token structure
class Token {
    constructor(type, value) {
      this.type = type;
      this.value = value;
    }
}
  
// Scanner (Lexer) class
class Scanner {
    constructor(input) {
      this.input = input;
      this.currentPosition = 0;
      this.keywords = [
        'int', 'char', 'float', 'double', 'if', 'else', 'for', 'while', 'do', 'return','string','char',
        'sizeof', 'struct', 'break', 'continue', 'switch', 'case', 'default', 'void','main'
      ];
    }
  
    isAlphaNumeric(char) {
      return /[a-zA-Z0-9_]/.test(char);
    }
  
    getNextToken() {
      while (this.currentPosition < this.input.length) {
        let char = this.input[this.currentPosition];
  
        // Ignore whitespace
        if (/\s/.test(char)) {
          this.currentPosition++;
          continue;
        }
  
        // Match integer
        if (/\d/.test(char)) {
          let value = '';
          while (/\d/.test(char)) {
            value += char;
            char = this.input[++this.currentPosition];
          }
          return new Token(TokenType.INTEGER, parseInt(value));
        }
  
        // Match string
        if (char === '"') {
          let value = '';
          char = this.input[++this.currentPosition];
          while (char !== '"' && this.currentPosition < this.input.length) {
            value += char;
            char = this.input[++this.currentPosition];
          }
          if (char !== '"') {
            console.error('Unterminated string literal');
            throw new Error('Unterminated string literal');
          }
          this.currentPosition++; // Move past the closing double-quote
          return new Token(TokenType.STRING, value);
        }
  
        // Match identifier or keyword
        if (this.isAlphaNumeric(char)) {
          let value = '';
          while (this.isAlphaNumeric(char)) {
            value += char;
            char = this.input[++this.currentPosition];
          }
          return new Token(this.keywords.includes(value) ? TokenType.KEYWORD : TokenType.IDENTIFIER, value);
        }
  
        // Match operators
        const operators = ['+', '-', '*', '/', '=', '==', '!=', '>', '<', '>=', '<=', '&&', '||', '&', '|', '^', '!', '~', '<<', '>>', '++', '--', '+=', '-=', '*=', '/='];
        for (const op of operators) {
          if (this.input.startsWith(op, this.currentPosition)) {
            this.currentPosition += op.length;
            return new Token(TokenType.OPERATOR, op);
          }
        }
  
        // Match parentheses, braces, brackets, and semicolon
        if (char === '(') {
          this.currentPosition++;
          return new Token(TokenType.LPAREN, '(');
        }
        if (char === ')') {
          this.currentPosition++;
          return new Token(TokenType.RPAREN, ')');
        }
        if (char === '{') {
          this.currentPosition++;
          return new Token(TokenType.LBRACE, '{');
        }
        if (char === '}') {
          this.currentPosition++;
          return new Token(TokenType.RBRACE, '}');
        }
        if (char === '[') {
          this.currentPosition++;
          return new Token(TokenType.LBRACKET, '[');
        }
        if (char === ']') {
          this.currentPosition++;
          return new Token(TokenType.RBRACKET, ']');
        }
        if (char === ';') {
          this.currentPosition++;
          return new Token(TokenType.SEMICOLON, ';');
        }
  
        console.error('Invalid character:', char);
        throw new Error('Invalid character');
      }
  
      return new Token(TokenType.END, null);
    }
    static fromFile(filename) {
        const input = fs.readFileSync(filename, 'utf-8');
        return new Scanner(input);
    }
}

// Example usage
const inputFilename = 'input.txt';
const outputFileScannername = 'outputscanner.txt';

try {
  const scanner = Scanner.fromFile(inputFilename);
  const outputTokens = [];

  let token = scanner.getNextToken();
  while (token.type !== TokenType.END) {
    outputTokens.push(token);
    token = scanner.getNextToken();
  }

  // Replace "value" with "lexeme" and "type" with "token"
  const updatedTokens = outputTokens.map(token => {
    return {
      lexeme: token.value,
      token: token.type,
    };
  });

  fs.writeFileSync(outputFileScannername, JSON.stringify(updatedTokens, null, 2));
  console.log(`Tokenization successful. Output written to ${outputFileScannername}`);
} catch (error) {
  console.error('Error:', error.message);
}
