const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Sample data arrays
const users = [
  { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phoneNumber: '1234567890', password: 'password123', avatar: 'https://i.pravatar.cc/150?u=1' },
  { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', phoneNumber: '2345678901', password: 'password123', avatar: 'https://i.pravatar.cc/150?u=2' },
  { firstName: 'Michael', lastName: 'Brown', email: 'michael.brown@example.com', phoneNumber: '3456789012', password: 'password123', avatar: 'https://i.pravatar.cc/150?u=3' },
  { firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@example.com', phoneNumber: '4567890123', password: 'password123', avatar: 'https://i.pravatar.cc/150?u=4' },
  { firstName: 'David', lastName: 'Wilson', email: 'david.wilson@example.com', phoneNumber: '5678901234', password: 'password123', avatar: 'https://i.pravatar.cc/150?u=5' },
  { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@example.com', phoneNumber: '6789012345', password: 'password123', avatar: 'https://i.pravatar.cc/150?u=6' },
  { firstName: 'Chris', lastName: 'Lee', email: 'chris.lee@example.com', phoneNumber: '7890123456', password: 'password123', avatar: 'https://i.pravatar.cc/150?u=7' },
  { firstName: 'Jessica', lastName: 'Martinez', email: 'jessica.martinez@example.com', phoneNumber: '8901234567', password: 'password123', avatar: 'https://i.pravatar.cc/150?u=8' },
  { firstName: 'Daniel', lastName: 'Garcia', email: 'daniel.garcia@example.com', phoneNumber: '9012345678', password: 'password123', avatar: 'https://i.pravatar.cc/150?u=9' },
  { firstName: 'Sophia', lastName: 'Anderson', email: 'sophia.anderson@example.com', phoneNumber: '1230987654', password: 'password123', avatar: 'https://i.pravatar.cc/150?u=10' }
];

const programmingLanguages = ['python', 'javascript', 'c', 'cpp', 'java', 'ruby', 'php', 'perl', 'bash', 'lua'];

const codeTemplateExamples = [
  {
    title: 'Hello World in Python',
    explanation: 'Basic Python program to print Hello World',
    codeSnippet: 'print("Hello, World!")',
    language: 'python',
    tags: ['beginner', 'python', 'basics']
  },
  {
    title: 'Variable Declaration in JavaScript',
    explanation: 'Different ways to declare variables in JavaScript using let, const, and var',
    codeSnippet: `// Using let for variables that can be reassigned
let count = 0;

// Using const for constants
const PI = 3.14159;

// Using var (older way, generally avoided in modern JS)
var name = "John";`,
    language: 'javascript',
    tags: ['variables', 'javascript', 'basics']
  },
  {
    title: 'Basic C Program Structure',
    explanation: 'The basic structure of a C program with main function',
    codeSnippet: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
    language: 'c',
    tags: ['c', 'basics', 'structure']
  },
  {
    title: 'Python List Operations',
    explanation: 'Common operations performed on lists in Python',
    codeSnippet: `# Creating a list
numbers = [1, 2, 3, 4, 5]

# Adding elements
numbers.append(6)        # Adds to end
numbers.insert(0, 0)     # Adds at index

# Removing elements
numbers.pop()            # Removes last element
numbers.remove(3)        # Removes first occurrence of 3

print(numbers)`,
    language: 'python',
    tags: ['python', 'lists', 'intermediate']
  },
  {
    title: 'String Manipulation in JavaScript',
    explanation: 'Examples of manipulating strings in JavaScript',
    codeSnippet: `let str = "Hello, World!";

// Convert to uppercase
console.log(str.toUpperCase());

// Replace a substring
console.log(str.replace("World", "JavaScript"));

// Extract substring
console.log(str.substring(7, 12));`,
    language: 'javascript',
    tags: ['strings', 'javascript', 'manipulation']
  },
  {
    title: 'Sorting Arrays in C',
    explanation: 'Sorting an array in C using bubble sort',
    codeSnippet: `#include <stdio.h>

void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n-1; i++) {
        for (int j = 0; j < n-i-1; j++) {
            if (arr[j] > arr[j+1]) {
                int temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
            }
        }
    }
}

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(arr)/sizeof(arr[0]);
    bubbleSort(arr, n);
    for (int i = 0; i < n; i++)
        printf("%d ", arr[i]);
    return 0;
}`,
    language: 'c',
    tags: ['sorting', 'arrays', 'c']
  },
  {
    title: 'Reading Files in Python',
    explanation: 'How to open, read, and close a file in Python',
    codeSnippet: `# Open a file
with open('example.txt', 'r') as file:
    content = file.read()
print(content)`,
    language: 'python',
    tags: ['file handling', 'python', 'basics']
  },
  {
    title: 'Create a Simple HTTP Server in Node.js',
    explanation: 'Basic HTTP server setup in Node.js',
    codeSnippet: `const http = require('http');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!');
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});`,
    language: 'javascript',
    tags: ['http', 'node.js', 'server']
  },
  {
    title: 'Factorial in Python',
    explanation: 'Recursive function to calculate factorial in Python',
    codeSnippet: `def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n-1)

print(factorial(5))`,
    language: 'python',
    tags: ['recursion', 'math', 'python']
  },
  {
    title: 'Basic Class in Python',
    explanation: 'Defining and using a class in Python',
    codeSnippet: `class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def greet(self):
        print(f"Hello, my name is {self.name} and I am {self.age} years old.")

person = Person("Alice", 25)
person.greet()`,
    language: 'python',
    tags: ['classes', 'oop', 'python']
  },
  {
    title: 'Linked List in C',
    explanation: 'Creating and traversing a linked list in C',
    codeSnippet: `#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node* next;
};

void printList(struct Node* n) {
    while (n != NULL) {
        printf("%d ", n->data);
        n = n->next;
    }
}

int main() {
    struct Node* head = NULL;
    struct Node* second = NULL;
    struct Node* third = NULL;

    head = (struct Node*)malloc(sizeof(struct Node));
    second = (struct Node*)malloc(sizeof(struct Node));
    third = (struct Node*)malloc(sizeof(struct Node));

    head->data = 1;
    head->next = second;

    second->data = 2;
    second->next = third;

    third->data = 3;
    third->next = NULL;

    printList(head);
    return 0;
}`,
    language: 'c',
    tags: ['data structures', 'linked list', 'c']
  },
  {
    title: 'Find Prime Numbers in Python',
    explanation: 'A simple function to find prime numbers up to a given limit',
    codeSnippet: `def is_prime(num):
    if num < 2:
        return False
    for i in range(2, int(num**0.5) + 1):
        if num % i == 0:
            return False
    return True

print([x for x in range(50) if is_prime(x)])`,
    language: 'python',
    tags: ['prime numbers', 'python', 'math']
  },
  {
    title: 'Math in Python',
    explanation: 'Basic Python program to showcase math operations',
    codeSnippet: 'print(4+5*3 % 3)',
    language: 'python',
    tags: ['beginner', 'python', 'math']
  },
  {
    title: 'FizzBuzz in JavaScript',
    explanation: 'Classic programming exercise to print Fizz, Buzz, or FizzBuzz based on divisibility',
    codeSnippet: `for (let i = 1; i <= 100; i++) {
  if (i % 3 === 0 && i % 5 === 0) console.log('FizzBuzz');
  else if (i % 3 === 0) console.log('Fizz');
  else if (i % 5 === 0) console.log('Buzz');
  else console.log(i);
}`,
    language: 'javascript',
    tags: ['beginner', 'javascript', 'exercise']
  },
  {
    title: 'File Handling in C',
    explanation: 'Demonstrates reading from and writing to a file in C',
    codeSnippet: `#include <stdio.h>

int main() {
    FILE *file = fopen("example.txt", "w");
    fprintf(file, "Hello, File!\\n");
    fclose(file);

    file = fopen("example.txt", "r");
    char line[100];
    while (fgets(line, sizeof(line), file)) {
        printf("%s", line);
    }
    fclose(file);

    return 0;
}`,
    language: 'c',
    tags: ['file handling', 'c', 'basics']
  },
  {
    title: 'Bubble Sort in Python',
    explanation: 'Implementation of bubble sort in Python',
    codeSnippet: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

print(bubble_sort([64, 34, 25, 12, 22, 11, 90]))`,
    language: 'python',
    tags: ['sorting', 'python', 'algorithms']
  },
  {
    title: 'React Functional Component',
    explanation: 'Basic functional component in React with state and props',
    codeSnippet: `import React, { useState } from 'react';

function Counter({ initialCount }) {
    const [count, setCount] = useState(initialCount);

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <button onClick={() => setCount(count - 1)}>Decrement</button>
        </div>
    );
}

export default Counter;`,
    language: 'javascript',
    tags: ['react', 'components', 'javascript']
  },
  {
    title: 'Find Fibonacci Numbers in Python',
    explanation: 'Recursive function to find Fibonacci numbers',
    codeSnippet: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print([fibonacci(i) for i in range(10)])`,
    language: 'python',
    tags: ['recursion', 'math', 'python']
  },
  {
    title: 'Promise in JavaScript',
    explanation: 'Demonstrates how to use a promise in JavaScript',
    codeSnippet: `const myPromise = new Promise((resolve, reject) => {
    let success = true; // Simulate success or failure
    if (success) resolve('Promise resolved!');
    else reject('Promise rejected.');
});

myPromise
    .then(result => console.log(result))
    .catch(error => console.error(error));`,
    language: 'javascript',
    tags: ['promises', 'javascript', 'async']
  },
  {
    title: 'Merge Two Arrays in Python',
    explanation: 'Merge two arrays and remove duplicates',
    codeSnippet: `def merge_arrays(arr1, arr2):
    return list(set(arr1 + arr2))

print(merge_arrays([1, 2, 3], [3, 4, 5]))`,
    language: 'python',
    tags: ['arrays', 'python', 'intermediate']
  },
  {
    title: 'HTTP GET Request in JavaScript',
    explanation: 'Using Fetch API to make an HTTP GET request',
    codeSnippet: `fetch('https://jsonplaceholder.typicode.com/posts')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));`,
    language: 'javascript',
    tags: ['http', 'javascript', 'api']
  },
  {
    title: 'Palindrome Check in Python',
    explanation: 'Check if a string is a palindrome',
    codeSnippet: `def is_palindrome(s):
    s = s.lower().replace(' ', '')
    return s == s[::-1]

print(is_palindrome("A man a plan a canal Panama"))`,
    language: 'python',
    tags: ['strings', 'python', 'intermediate']
  },
  {
    title: 'Unit Test in Python Using unittest',
    explanation: 'Basic example of a unit test in Python',
    codeSnippet: `import unittest

def add(a, b):
    return a + b

class TestMathOperations(unittest.TestCase):
    def test_add(self):
        self.assertEqual(add(2, 3), 5)

if __name__ == '__main__':
    unittest.main()`,
    language: 'python',
    tags: ['testing', 'unittest', 'python']
  },
  {
    title: 'Event Listener in JavaScript',
    explanation: 'Using an event listener to handle button clicks',
    codeSnippet: `document.querySelector('#myButton').addEventListener('click', () => {
    alert('Button was clicked!');
});`,
    language: 'javascript',
    tags: ['events', 'javascript', 'dom']
  },
  {
    title: 'Count Words in a String in Python',
    explanation: 'Count the number of words in a given string',
    codeSnippet: `def count_words(s):
    return len(s.split())

print(count_words("This is a test string."))`,
    language: 'python',
    tags: ['strings', 'python', 'basics']
  },
  {
    title: 'Hello World in Java',
    explanation: 'Basic Java program to print Hello World',
    codeSnippet: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    language: 'java',
    tags: ['java', 'beginner', 'basics']
  },
  {
    title: 'String Interpolation in Ruby',
    explanation: 'How to use string interpolation in Ruby',
    codeSnippet: `name = "Alice"
age = 25
puts "My name is #{name} and I am #{age} years old."`,
    language: 'ruby',
    tags: ['ruby', 'strings', 'interpolation']
  },
  {
    title: 'Connecting to MySQL in PHP',
    explanation: 'Basic PHP code to connect to a MySQL database',
    codeSnippet: `<?php
$servername = "localhost";
$username = "root";
$password = "password";
$dbname = "example_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully";
?>`,
    language: 'php',
    tags: ['php', 'mysql', 'databases']
  },
  {
    title: 'Regular Expressions in Perl',
    explanation: 'Using regular expressions to match patterns in Perl',
    codeSnippet: `my $text = "The quick brown fox";
if ($text =~ /quick/) {
    print "Match found!\\n";
} else {
    print "No match.\\n";
}`,
    language: 'perl',
    tags: ['perl', 'regex', 'strings']
  },
  {
    title: 'File Manipulation in Bash',
    explanation: 'How to create, write to, and read a file in Bash',
    codeSnippet: `#!/bin/bash
echo "Hello, Bash!" > example.txt
cat example.txt`,
    language: 'bash',
    tags: ['bash', 'file handling', 'basics']
  },
  {
    title: 'Simple Table in Lua',
    explanation: 'Defining and iterating through a table in Lua',
    codeSnippet: `local fruits = {"apple", "banana", "cherry"}

for index, fruit in ipairs(fruits) do
    print(index, fruit)
end`,
    language: 'lua',
    tags: ['lua', 'tables', 'loops']
  },
  {
    title: 'Factorial in Java',
    explanation: 'Using recursion to calculate factorial in Java',
    codeSnippet: `public class Factorial {
    public static int factorial(int n) {
        if (n == 0) return 1;
        return n * factorial(n - 1);
    }

    public static void main(String[] args) {
        System.out.println(factorial(5));
    }
}`,
    language: 'java',
    tags: ['java', 'recursion', 'math']
  },
  {
    title: 'Command-Line Arguments in Bash',
    explanation: 'How to handle command-line arguments in a Bash script',
    codeSnippet: `#!/bin/bash
echo "First argument: $1"
echo "Second argument: $2"`,
    language: 'bash',
    tags: ['bash', 'command-line', 'basics']
  },
  {
    title: 'Classes in Ruby',
    explanation: 'Defining and using a class in Ruby',
    codeSnippet: `class Animal
  def initialize(name)
    @name = name
  end

  def speak
    puts "I am #{@name}"
  end
end

dog = Animal.new("Dog")
dog.speak`,
    language: 'ruby',
    tags: ['ruby', 'classes', 'oop']
  },
  {
    title: 'HTTP GET Request in PHP',
    explanation: 'Using cURL to make an HTTP GET request in PHP',
    codeSnippet: `<?php
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, "https://jsonplaceholder.typicode.com/posts/1");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>`,
    language: 'php',
    tags: ['php', 'http', 'api']
  }
];

const commentExamples = [
  'Great article! Very helpful.',
  'Thanks for sharing this knowledge.',
  'This helped me understand the concept better.',
  'Could you provide more examples?',
  'The explanation was clear and concise.',
  'I struggled with this topic before, but this post made it much easier.',
  'Looking forward to more tutorials like this!',
  'The code snippet is really useful. Thanks!',
  'Can you add more details about advanced use cases?',
  'I love how you break down complex topics!',
  'This was exactly what I needed. Thank you!',
  'I’ve bookmarked this for future reference.',
  'Your writing style is very engaging.',
  'Do you have any recommendations for further reading?',
  'This was a game-changer for me. Thanks a lot!',
  'I appreciate the effort you put into this post.',
  'This blog is a treasure trove of knowledge.',
  'Could you explain this in the context of a real-world project?',
  'I found a typo in the code snippet, but the explanation is solid.',
  'Awesome post! Keep it up!',
  'The linked templates were a nice touch.',
  'I had no idea about this approach. Very informative!',
  'Your post saved me hours of debugging.',
  'I think this concept could be explained in a simpler way.',
  'Do you have any video tutorials on this?',
  'I shared this with my team, and they loved it too!',
  'The tags helped me find exactly what I was looking for.',
  'I wish I had found this earlier in my learning journey.',
  'The comments section is buzzing with ideas. Great engagement!',
  'This was the most comprehensive post on this topic I’ve seen.',
  'I’m struggling with a similar issue; could you help?',
  'Your content stands out for its clarity and depth.',
  'This is gold for beginners like me!',
  'I think there’s an edge case not covered in the snippet.',
  'Fantastic explanation! Kudos to the author.',
  'Can I contribute to your blog with guest posts?',
  'I’m applying this to my project right now. Thanks for the tips!',
  'This is a must-read for anyone starting with this language.',
  'I can’t wait to try this out on my own.',
  'Could you elaborate on how this integrates with other tools?'
];

// Helper function to get random item from array
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper function to get random items from array
const getRandomItems = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

async function populateDatabase() {
  try {
    console.log('Starting database population...');
    console.log(`Using API endpoint: ${BASE_URL}`);
    
    // // Step 1: Create users
    // console.log('Creating users...');
    // const userTokens = [];
    
    // for (const user of users) {
    //   try {
    //     console.log(`Attempting to create user ${user.email}...`);
        
    //     let signupResponse;
    //     try {
    //       signupResponse = await axios.post(`${BASE_URL}/accounts/signup`, user);
    //     } catch (error) {
    //       if (error.response?.status === 400 && error.response?.data?.error?.includes('already exists')) {
    //         console.log(`User ${user.email} already exists, attempting login...`);
    //       } else {
    //         console.error(`Error during signup for ${user.email}:`, {
    //           status: error.response?.status,
    //           data: error.response?.data,
    //           message: error.message
    //         });
    //         continue;
    //       }
    //     }
        
    //     const loginResponse = await axios.post(`${BASE_URL}/accounts/login`, {
    //       email: user.email,
    //       password: user.password
    //     }).catch(error => {
    //       console.error(`Error during login for ${user.email}:`, {
    //         status: error.response?.status,
    //         data: error.response?.data,
    //         message: error.message
    //       });
    //       throw error;
    //     });
        
    //     if (!loginResponse.data.accessToken) {
    //       throw new Error('No access token received from login');
    //     }
        
    //     userTokens.push({
    //       email: user.email,
    //       token: loginResponse.data.accessToken
    //     });
    //     console.log(`Successfully logged in user: ${user.email}`);
    //   } catch (error) {
    //     console.error(`Failed to create/login user ${user.email}:`, {
    //       status: error.response?.status,
    //       data: error.response?.data,
    //       message: error.message
    //     });
    //   }
    // }

    // if (userTokens.length === 0) {
    //   throw new Error('No users were created/logged in successfully. Cannot continue.');
    // }

    // Step 2: Create code templates
    console.log('Creating code templates...');
    const codeTemplates = [];
    for (const template of codeTemplateExamples) {
      try {
        const userToken = getRandomItem(userTokens);
        // Ensure the language is supported
        if (!SUPPORTED_LANGUAGES.includes(template.language.toLowerCase())) {
          console.log(`Skipping template "${template.title}" - unsupported language: ${template.language}`);
          continue;
        }
        
        const response = await axios.post(
          `${BASE_URL}/code-templates/create`,
          template,
          {
            headers: { Authorization: `Bearer ${userToken.token}` }
          }
        ).catch(error => {
          console.error(`Failed to create template "${template.title}":`, {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
          });
          throw error;
        });
        
        codeTemplates.push(response.data.codeTemplateId);
        console.log(`Successfully created template: ${template.title}`);
      } catch (error) {
        console.error(`Failed to create template "${template.title}"`);
      }
    }

    // Step 3: Create blog posts
    console.log('Creating blog posts...');
    const blogPosts = [];
    for (let i = 0; i < codeTemplateExamples.length; i++) {
      const userToken = userTokens[i % userTokens.length]; // Cycle through users
      const template = codeTemplateExamples[i];
      
      const post = {
        title: `Understanding ${template.title}`,
        description: `A detailed explanation of ${template.title.toLowerCase()} and how it works. We'll explore the code structure, syntax, and common use cases.`,
        tags: [...template.tags], // Use the template's tags for the blog post
        codeTemplates: [codeTemplates[i]] // Link to corresponding template
      };
      
      try {
        const response = await axios.post(
          `${BASE_URL}/blogPosts/create`,
          post,
          {
            headers: { Authorization: `Bearer ${userToken.token}` }
          }
        );
        blogPosts.push(response.data.id);
        console.log(`Successfully created blog post: ${post.title}`);
      } catch (error) {
        console.error(`Failed to create blog post "${post.title}":`, {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
    }

    console.log('Database populated successfully!');
  } catch (error) {
    console.error('Population failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

populateDatabase();