Sudoku
=======

An implementation of Sudoku using JavaScript, jQuery, Underscore.js, and Sass. I wanted to create a version of the game, with a pleasant, modern-feeling flat UI, that waseasy to use in both the browser and on a mobile device.

Users select a puzzle difficulty from the initial menu to start a game. Once the game is started, the user can use the button menu on the left side of the board to select a number, and then click on squares on the board to fill them in with that number. Existing squares containing the selected number are also highlighted, making it easier to see where to avoid placing the current number.

Clicking on the pencil button at the top of the menu actives Note Mode. While in Note Mode, clicking on a board square adds the number to the box as a note, rather than filling in the square. This way the user can keep track of possible guesses for any square. The user can add as many numbers as they want to the note. Clicking on an existing note with the same number will remove that number from the note.

If the user gets stuck, they can click on the "?" button to reveal any conflicting squares (squares in the same row, column, or box that contain the same value). If they get really stuck, or just want to check their work, they can click on the "&#x2713;" button, which will highlight any square that doesn't match the puzzle answer in yellow. The user can also select the "X" button to delete values from squares.

The rendering of the interface is responsive to screen size. On smaller portrait screens, the button menu moves from the left of the board to underneath it, and both the buttons and the board shrink in size for very small screen sizes.

Currently, the game reads in boards from a JavaScript object contained in the boards.js file. In a production environment, this could easily be modified to take in a JSON string from a server or a URL. Given more time, I'd like to try implementing my own board generator, but for this project I wanted to focus on providing a rich UI experience. I'd also like to modify the notes feature so that numbers are automatically removed from the notes if they conflict with any existing answers.

I have tried to keep the reliance on JS libraries very minimal. I used jQuery for event detection, selecting elements from the DOM, and dynamically adding and removing CSS classes. Underscore.js was used for the convenience of its iterative array functions (each, map, flatten) for iterating through the board squares. I use SASS to preprocess the CSS to keep the styles modular and organized.  

