import requests

# Define the API endpoint
API_URL = "http://localhost:3000/api/code-templates/run"

# Test cases for each language
test_cases = [
    {
        "language": "python",
        "valid": {
            "codeSnippet": "name = input('Enter your name: ')\nprint(f'Hello, {name}!')",
            "stdin": "Alice",
        },
        "error": {
            "codeSnippet": "print(1 / 0)",  # Division by zero to trigger an error
            "stdin": "",
        },
    },
    {
        "language": "javascript",
        "valid": {
            "codeSnippet": "const readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin, output: process.stdout });\nrl.question('Enter your name: ', (name) => { console.log(`Hello, ${name}!`); rl.close(); });",
            "stdin": "Alice",
        },
        "error": {
            "codeSnippet": "console.log(1 / 0);",  # JS doesn't throw errors for division by zero but will log Infinity
            "stdin": "",
        },
    },
    {
        "language": "c",
        "valid": {
            "codeSnippet": "#include <stdio.h>\nint main() {\n    char name[50];\n    printf(\"Enter your name: \");\n    scanf(\"%s\", name);\n    printf(\"Hello, %s!\\n\", name);\n    return 0;\n}",
            "stdin": "Alice",
        },
        "error": {
            "codeSnippet": "#include <stdio.h>\nint main() { printf(\"%d\\n\", 1 / 0); return 0; }",  # Division by zero error
            "stdin": "",
        },
    },
    {
        "language": "cpp",
        "valid": {
            "codeSnippet": "#include <iostream>\n#include <string>\nint main() {\n    std::string name;\n    std::cout << \"Enter your name: \";\n    std::cin >> name;\n    std::cout << \"Hello, \" << name << \"!\" << std::endl;\n    return 0;\n}",
            "stdin": "Alice",
        },
        "error": {
            "codeSnippet": "#include <iostream>\nint main() { int x = 1 / 0; return 0; }",  # Division by zero error
            "stdin": "",
        },
    },
    {
        "language": "java",
        "valid": {
            "codeSnippet": "import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        System.out.print(\"Enter your name: \");\n        String name = scanner.nextLine();\n        System.out.println(\"Hello, \" + name + \"!\");\n    }\n}",
            "stdin": "Alice",
        },
        "error": {
            "codeSnippet": "public class Main { public static void main(String[] args) { System.out.println(1 / 0); } }",  # Division by zero
            "stdin": "",
        },
    },
    {
        "language": "ruby",
        "valid": {
            "codeSnippet": "name = gets.chomp\nputs \"Hello, #{name}!\"",
            "stdin": "Alice",
        },
        "error": {
            "codeSnippet": "puts 1 / 0",  # Division by zero error
            "stdin": "",
        },
    },
    {
        "language": "php",
        "valid": {
            "codeSnippet": "<?php\n$name = trim(fgets(STDIN));\necho \"Hello, $name!\\n\";",
            "stdin": "Alice",
        },
        "error": {
            "codeSnippet": "<?php\necho 1 / 0;",  # Division by zero error
            "stdin": "",
        },
    },
    {
        "language": "perl",
        "valid": {
            "codeSnippet": "my $name = <STDIN>;\nchomp($name);\nprint \"Hello, $name!\\n\";",
            "stdin": "Alice",
        },
        "error": {
            "codeSnippet": "print 1 / 0;",  # Division by zero error
            "stdin": "",
        },
    },
    {
        "language": "bash",
        "valid": {
            "codeSnippet": "read -p \"Enter your name: \" name\necho \"Hello, $name!\"",
            "stdin": "Alice",
        },
        "error": {
            "codeSnippet": "echo $((1 / 0))",  # Division by zero error
            "stdin": "",
        },
    },
    {
        "language": "lua",
        "valid": {
            "codeSnippet": "io.write(\"Enter your name: \")\nlocal name = io.read()\nprint(\"Hello, \" .. name .. \"!\")",
            "stdin": "Alice",
        },
        "error": {
            "codeSnippet": "print(1 / 0)",  # Division by zero error
            "stdin": "",
        },
    },
]

# Function to send requests to the API
def test_language(language, codeSnippet, stdin, test_type):
    response = requests.post(API_URL, json={"language": language, "codeSnippet": codeSnippet, "stdin": stdin})
    print(f"Testing language: {language} ({test_type})")
    if response.status_code == 200:
        result = response.json()
        print(f"Output: {result['outputString']}")
        print(f"Errors: {result['errorString']}\n")
    else:
        print(f"Failed to test {language} ({test_type}): HTTP {response.status_code}\n")

# Iterate through test cases and test each twice
for test_case in test_cases:
    # Test valid case
    test_language(
        test_case["language"],
        test_case["valid"]["codeSnippet"],
        test_case["valid"]["stdin"],
        "Valid",
    )
    # Test error case
    test_language(
        test_case["language"],
        test_case["error"]["codeSnippet"],
        test_case["error"]["stdin"],
        "Error",
    )
