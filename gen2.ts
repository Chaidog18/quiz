import fs from 'fs';

const realQuestions = [
  ["What does HTML stand for?", "Hyper Text Markup Language", "Hyperlinks and Text Markup Language", "Home Tool Markup Language", "Hyper Tool Markup Language"],
  ["What does CSS stand for?", "Cascading Style Sheets", "Computer Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"],
  ["What does JS stand for?", "JavaScript", "JavaSource", "JustScript", "JumboScript"],
  ["Which HTML tag is used to define an internal style sheet?", "<style>", "<css>", "<script>", "<link>"],
  ["Which HTML attribute is used to define inline styles?", "style", "class", "font", "styles"],
  ["Which is the correct CSS syntax?", "body {color: black;}", "{body:color=black;}", "{body;color:black;}", "body:color=black;"],
  ["How do you insert a comment in a CSS file?", "/* this is a comment */", "// this is a comment", "// this is a comment //", "' this is a comment"],
  ["Which property is used to change the background color?", "background-color", "color", "bgcolor", "bg-color"],
  ["How do you add a background color for all <h1> elements?", "h1 {background-color:#FFFFFF;}", "h1.all {background-color:#FFFFFF;}", "all.h1 {background-color:#FFFFFF;}", "h1 {bgcolor:#FFFFFF;}"],
  ["Which CSS property is used to change the text color of an element?", "color", "text-color", "fgcolor", "font-color"],
  ["Which CSS property controls the text size?", "font-size", "text-style", "text-size", "font-style"],
  ["What is the correct syntax for referring to an external script called 'xxx.js'?", "<script src='xxx.js'>", "<script href='xxx.js'>", "<script name='xxx.js'>", "<script file='xxx.js'>"],
  ["How do you write 'Hello World' in an alert box?", "alert('Hello World');", "msg('Hello World');", "msgBox('Hello World');", "alertBox('Hello World');"],
  ["How do you create a function in JavaScript?", "function myFunction()", "function:myFunction()", "function = myFunction()", "create myFunction()"],
  ["How do you call a function named 'myFunction'?", "myFunction()", "call function myFunction()", "call myFunction()", "myFunction(call)"],
  ["How to write an IF statement in JavaScript?", "if (i === 5)", "if i = 5 then", "if i == 5 then", "if i = 5"],
  ["How does a WHILE loop start?", "while (i <= 10)", "while i = 1 to 10", "while (i <= 10; i++)", "until (i <= 10)"],
  ["How does a FOR loop start?", "for (let i = 0; i <= 5; i++)", "for (i <= 5; i++)", "for i = 1 to 5", "for (i = 0; i <= 5)"],
  ["How can you add a comment in a JavaScript?", "//This is a comment", "<!--This is a comment-->", "'This is a comment", "/*This is a comment*/"],
  ["What is the correct way to write a JavaScript array?", "let colors = ['red', 'green', 'blue']", "let colors = (1:'red', 2:'green', 3:'blue')", "let colors = 1 = ('red'), 2 = ('green'), 3 = ('blue')", "let colors = 'red', 'green', 'blue'"],
  ["How do you round the number 7.25, to the nearest integer?", "Math.round(7.25)", "rnd(7.25)", "Math.rnd(7.25)", "round(7.25)"],
  ["How do you find the number with the highest value of x and y?", "Math.max(x, y)", "Math.ceil(x, y)", "top(x, y)", "ceil(x, y)"],
  ["What is the correct JavaScript syntax for opening a new window called 'w2'?", "w2 = window.open('http://www.w3schools.com');", "w2 = window.new('http://www.w3schools.com');", "w2 = window.create('http://www.w3schools.com');", "w2 = window.load('http://www.w3schools.com');"],
  ["JavaScript is the same as Java.", "False", "True", "Maybe", "Sometimes"],
  ["Which event occurs when the user clicks on an HTML element?", "onclick", "onchange", "onmouseclick", "onmouseover"],
  ["How do you declare a JavaScript variable?", "let carName;", "v carName;", "variable carName;", "declare carName;"],
  ["Which operator is used to assign a value to a variable?", "=", "*", "-", "x"],
  ["What will the following code return: Boolean(10 > 9)", "true", "false", "NaN", "undefined"],
  ["Is JavaScript case-sensitive?", "Yes", "No", "Only in strict mode", "Only for variables"],
  ["What does DOM stand for?", "Document Object Model", "Data Object Model", "Document Oriented Model", "Data Oriented Model"],
  ["Which method is used to select an element by its ID?", "document.getElementById()", "document.getElementByClass()", "document.selectId()", "document.querySelectorId()"],
  ["Which method is used to select elements by their class name?", "document.getElementsByClassName()", "document.getElementByClass()", "document.selectClass()", "document.querySelectorAllClass()"],
  ["What is the purpose of the 'alt' attribute in an <img> tag?", "Provides alternative text for an image", "Specifies the image URL", "Sets the image alignment", "Defines the image size"],
  ["Which HTML tag is used to define a table?", "<table>", "<tbl>", "<tab>", "<grid>"],
  ["Which HTML tag is used to define a table row?", "<tr>", "<td>", "<th>", "<table-row>"],
  ["Which HTML tag is used to define a table header?", "<th>", "<tr>", "<td>", "<head>"],
  ["Which HTML tag is used to define a table data cell?", "<td>", "<tr>", "<th>", "<cell>"],
  ["Which HTML tag is used to create an unordered list?", "<ul>", "<ol>", "<li>", "<list>"],
  ["Which HTML tag is used to create an ordered list?", "<ol>", "<ul>", "<li>", "<list>"],
  ["Which HTML tag is used to define a list item?", "<li>", "<ul>", "<ol>", "<item>"],
  ["What is the default display value of a <div> element?", "block", "inline", "inline-block", "none"],
  ["What is the default display value of a <span> element?", "inline", "block", "inline-block", "none"],
  ["Which CSS property is used to create space around elements, outside of any defined borders?", "margin", "padding", "border", "spacing"],
  ["Which CSS property is used to create space around elements, inside of any defined borders?", "padding", "margin", "border", "spacing"],
  ["Which CSS property is used to change the font of an element?", "font-family", "font-style", "font-weight", "text-font"],
  ["How do you make the text bold in CSS?", "font-weight: bold;", "font: bold;", "text-weight: bold;", "style: bold;"],
  ["How do you display hyperlinks without an underline?", "a {text-decoration: none;}", "a {underline: none;}", "a {decoration: no-underline;}", "a {text-style: no-underline;}"],
  ["How do you make each word in a text start with a capital letter?", "text-transform: capitalize;", "text-transform: uppercase;", "font-transform: capitalize;", "text-style: capitalize;"],
  ["Which property is used to change the left margin of an element?", "margin-left", "padding-left", "indent", "left-margin"],
  ["Which CSS property controls how an element is positioned?", "position", "display", "float", "align"],
  ["Which HTML5 element is used to specify a footer for a document or section?", "<footer>", "<bottom>", "<section>", "<div>"],
  ["In HTML, which attribute is used to specify that an input field must be filled out?", "required", "placeholder", "validate", "formvalidate"],
  ["Which input type defines a slider control?", "range", "slider", "controls", "search"],
  ["Which HTML element is used to display a scalar measurement within a range?", "<meter>", "<gauge>", "<range>", "<measure>"],
  ["Which HTML element defines navigation links?", "<nav>", "<navigate>", "<navigation>", "<links>"],
  ["In CSS, what does 'vh' stand for?", "Viewport Height", "Vertical Height", "Visual Height", "View Height"],
  ["What is the default value of the position property?", "static", "relative", "absolute", "fixed"],
  ["How do you select an element with id 'demo'?", "#demo", ".demo", "demo", "*demo"],
  ["How do you select elements with class name 'test'?", ".test", "#test", "test", "*test"],
  ["How do you select all p elements inside a div element?", "div p", "div + p", "div > p", "div ~ p"],
  ["What is the correct CSS syntax to change the font name?", "font-family:", "font-name:", "font:", "font-style:"],
  ["Which property is used to change the right margin of an element?", "margin-right", "padding-right", "right-margin", "margin"],
  ["Which CSS property is used to specify the transparency of an element?", "opacity", "transparent", "visibility", "filter"],
  ["How do you make a list that lists its items with squares?", "list-style-type: square;", "list: square;", "list-type: square;", "list-style: square;"],
  ["What is the correct JavaScript syntax to change the content of the HTML element <p id='demo'>This is a demonstration.</p>?", "document.getElementById('demo').innerHTML = 'Hello World!';", "document.getElement('p').innerHTML = 'Hello World!';", "#demo.innerHTML = 'Hello World!';", "document.getElementByName('p').innerHTML = 'Hello World!';"],
  ["Where is the correct place to insert a JavaScript?", "Both the <head> section and the <body> section are correct", "The <body> section", "The <head> section", "The <footer> section"],
  ["How to write an IF statement for executing some code if 'i' is NOT equal to 5?", "if (i != 5)", "if i <> 5", "if (i <> 5)", "if i =! 5 then"],
  ["How does a FOR loop start if you want it to run 5 times?", "for (let i = 0; i < 5; i++)", "for (i = 1 to 5)", "for (i <= 5; i++)", "for (i = 0; i <= 5)"],
  ["What is the correct way to write a JavaScript object?", "const person = {firstName:'John', lastName:'Doe'};", "const person = (firstName:'John', lastName:'Doe');", "const person = 'firstName':'John', 'lastName':'Doe';", "const person = [firstName:'John', lastName:'Doe'];"],
  ["How do you find the minimum of x and y using JavaScript?", "Math.min(x,y)", "min(x,y)", "Math.lowest(x,y)", "lowest(x,y)"],
  ["Which JavaScript operator is used to determine the type of a variable?", "typeof", "type", "instanceof", "class"],
  ["What will `typeof null` return in JavaScript?", "'object'", "'null'", "'undefined'", "'boolean'"],
  ["Which method removes the last element from an array and returns that element?", "pop()", "push()", "shift()", "unshift()"],
  ["Which method adds one or more elements to the end of an array and returns the new length?", "push()", "pop()", "shift()", "unshift()"],
  ["Which method removes the first element from an array and returns that element?", "shift()", "unshift()", "pop()", "push()"],
  ["Which method adds one or more elements to the beginning of an array and returns the new length?", "unshift()", "shift()", "push()", "pop()"],
  ["What does the `isNaN()` function do?", "Determines whether a value is NaN (Not-a-Number)", "Checks if a variable is a number", "Converts a string to a number", "Returns true if the value is a string"],
  ["Which method converts a JSON string into a JavaScript object?", "JSON.parse()", "JSON.stringify()", "JSON.toObject()", "JSON.convert()"],
  ["Which method converts a JavaScript object into a JSON string?", "JSON.stringify()", "JSON.parse()", "JSON.toString()", "JSON.convert()"],
  ["What does the `localStorage` object do?", "Stores data with no expiration date", "Stores data for one session", "Stores data on the server", "Stores data in a cookie"],
  ["What does the `sessionStorage` object do?", "Stores data for one session", "Stores data with no expiration date", "Stores data on the server", "Stores data in a cookie"],
  ["Which event occurs when a user changes the content of an input field?", "onchange", "oninput", "onmodify", "onedit"],
  ["Which event occurs when a form is submitted?", "onsubmit", "onclick", "onsend", "onpost"],
  ["Which event occurs when a page has finished loading?", "onload", "onready", "onfinish", "oncomplete"],
  ["What does the `preventDefault()` method do?", "Prevents the default action of an event from happening", "Stops the event from bubbling up the DOM tree", "Removes an event listener", "Triggers an event programmatically"],
  ["What does the `stopPropagation()` method do?", "Stops the event from bubbling up the DOM tree", "Prevents the default action of an event from happening", "Removes an event listener", "Triggers an event programmatically"],
  ["What is a Promise in JavaScript?", "An object representing the eventual completion or failure of an asynchronous operation", "A guarantee that a function will return a value", "A way to define a class", "A strict mode feature"],
  ["Which keyword is used to wait for a Promise to resolve?", "await", "wait", "yield", "async"],
  ["Which keyword is used to define an asynchronous function?", "async", "defer", "promise", "await"],
  ["What is the purpose of the `fetch()` API?", "To make network requests", "To fetch elements from the DOM", "To retrieve data from localStorage", "To load external scripts"],
  ["What does CORS stand for?", "Cross-Origin Resource Sharing", "Cross-Origin Request Security", "Cross-Origin Resource Security", "Cross-Origin Request Sharing"],
  ["Which HTTP method is typically used to retrieve data?", "GET", "POST", "PUT", "DELETE"],
  ["Which HTTP method is typically used to submit data to be processed?", "POST", "GET", "PUT", "DELETE"],
  ["Which HTTP method is typically used to update existing data?", "PUT", "GET", "POST", "DELETE"],
  ["Which HTTP method is typically used to delete data?", "DELETE", "GET", "POST", "PUT"],
  ["What is the purpose of a CSS preprocessor like Sass or Less?", "To add features like variables and mixins to CSS", "To minify CSS files", "To convert CSS to JavaScript", "To automatically prefix CSS properties"],
  ["What is a CSS framework?", "A pre-prepared library that is meant to be used as a base for starting a project", "A tool for compiling CSS", "A JavaScript library for styling", "A browser extension for debugging CSS"],
  ["What does responsive web design mean?", "Designing websites that adapt to different screen sizes and devices", "Designing websites that load quickly", "Designing websites that are accessible to users with disabilities", "Designing websites that use modern JavaScript features"],
  ["Which CSS unit is relative to the font-size of the root element?", "rem", "em", "px", "vh"],
  ["Which CSS unit is relative to the font-size of the element itself?", "em", "rem", "px", "vw"]
];

const content = \`export interface Question {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

const rawQuestions = \${JSON.stringify(realQuestions, null, 2)};

export const QUESTIONS: Question[] = rawQuestions.map((q, i) => {
  const options = [q[1], q[2], q[3], q[4]].sort(() => Math.random() - 0.5);
  return {
    id: "q_" + i,
    category: "Web Programming",
    question: q[0],
    options: options,
    correctAnswer: q[1]
  };
});
\`;

fs.writeFileSync('src/questions.ts', content);
